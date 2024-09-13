import { expect, describe, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_feature, create_label, create_project, create_status, create_task, create_user } from "./utils";
import { MemoryEvents } from "../src/events";
import type { Transaction } from "../src/db/types";
import { RecordId, StringRecordId, surql } from "surrealdb";

test("Create task", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);
	const status = await create_status(client);

	const response = await client.api.tasks.post({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", assignee: null, status: status.id });

	expect(response.status).toBe(200);

	const { data: task } = await client.api.tasks({ id: response.data.id }).get();

	if (task === null) { throw new Error("Task is null"); }

	expect(task).toMatchObject({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", });

	const task_create_events = await eq.get("task.create");

	expect(task_create_events).toMatchObject([{ id: response.data.id }]);

	const [[task_create_transaction]] = await db.query<[Transaction[]]>(surql`SELECT * FROM Transaction WHERE oid = ${new StringRecordId(task.id)};`);
	expect(task_create_transaction).toMatchObject({ oid: new RecordId(task.id.split(':')[0], task.id.split(':')[1]), action: "CREATE", class: "Task", path: null });
});

describe("Close task", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);
	const { data: resolved_status } = await client.api.projects({ id: project.id }).statuses.post({ state: "Resolved", name: "Resolved", });

	if (!resolved_status) { throw new Error("Resolved status not created"); }

	test("as resolved", async () => {
		const task = await create_task(client, status);

		const response = await client.api.tasks({ id: task.id }).put({ id: resolved_status.id, close_as: "Resolved", note: "This task was completed!" });

		expect(response.status).toBe(200);

		const closed_task = await client.api.tasks({ id: task.id }).get();

		expect(closed_task.status).toBe(200);
		expect(closed_task.data).toMatchObject({ status: { id: resolved_status.id, closed_as: "Resolved", note: "This task was completed!" } });
	});

	test("as duplicate", async () => {
		const task = await create_task(client, status);
		const duplicate_task = await create_task(client, status);

		const response = await client.api.tasks({ id: duplicate_task.id }).put({ id: resolved_status.id, close_as: "Duplicate", original: task.id });

		const closed_task = await client.api.tasks({ id: duplicate_task.id }).get();

		expect(closed_task.status).toBe(200);
		expect(closed_task.data).toMatchObject({ status: { id: resolved_status.id, closed_as: "Duplicate", original: task.id } });
	});

	test("as canceled", async () => {
		const task = await create_task(client, status);

		const response = await client.api.tasks({ id: task.id }).put({ id: resolved_status.id, close_as: "Cancelled", note: "This task was canceled!" });

		expect(response.status).toBe(200);

		const closed_task = await client.api.tasks({ id: task.id }).get();

		expect(closed_task.status).toBe(200);
		expect(closed_task.data).toMatchObject({ status: { id: resolved_status.id, closed_as: "Cancelled", note: "This task was canceled!" } });
	});
});

describe("Related tasks", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	
	const client = treaty(server(db, eq));
	
	const user = await create_user(client);
	const status = await create_status(client);

	test("add", async () => {
		const task = await create_task(client, status);
		const related_task = await create_task(client, status);
	
		const response = await client.api.tasks({ id: task.id }).related.post({ id: related_task.id });
	
		expect(response.status).toBe(200);
	
		const { data: tasks } = await client.api.tasks({ id: task.id }).related.get();
	
		expect(tasks).toMatchObject([{ id: related_task.id }]);
	});

	test("duplicate add", async () => {
		const task = await create_task(client, status);
		const related_task = await create_task(client, status);
	
		{ // First add
			const response = await client.api.tasks({ id: task.id }).related.post({ id: related_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Second add
			const response = await client.api.tasks({ id: task.id }).related.post({ id: related_task.id });
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).related.get();
	
		expect(tasks).toMatchObject([{ id: related_task.id }]);
	});

	test("add self", async () => {
		const task = await create_task(client, status);
		const related_task = await create_task(client, status);

		{
			const response = await client.api.tasks({ id: task.id }).related.post({ id: task.id });
			expect(response.status).toBe(500);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).related.get();
		expect(tasks).toMatchObject([]);
	});

	test("delete", async () => {
		const task = await create_task(client, status);
		const related_task = await create_task(client, status);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).related.post({ id: related_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Delete
			const response = await client.api.tasks({ id: related_task.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).related.get();
	
		expect(tasks).toMatchObject([]);
	});

	test("remove", async () => {
		const task = await create_task(client, status);
		const related_task = await create_task(client, status);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).related.post({ id: related_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Remove
			const response = await client.api.tasks({ id: task.id }).related({ rid: related_task.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).related.get();
	
		expect(tasks).toMatchObject([]);
	});
});

describe("Tackled", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	
	const client = treaty(server(db, eq));
	
	const user = await create_user(client);
	const status = await create_status(client);

	test("add", async () => {
		const task = await create_task(client, status);
		const feature = await create_feature(client);
	
		const response = await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });
	
		expect(response.status).toBe(200);
	
		const { data: features } = await client.api.tasks({ id: task.id }).tackled.get();
	
		expect(features).toMatchObject([{ id: feature.id }]);
	});

	test("duplicate add", async () => {
		const task = await create_task(client, status);
		const feature = await create_feature(client);
	
		{ // First add
			const response = await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });
			expect(response.status).toBe(200);
		}
	
		{ // Second add
			const response = await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });
			expect(response.status).toBe(200);
		}

		const { data: features } = await client.api.tasks({ id: task.id }).tackled.get();
	
		expect(features).toMatchObject([{ id: feature.id }]);
	});

	test("add non feature or bug", async () => {
		const task = await create_task(client, status);
		const feature = await create_feature(client);

		{
			const response = await client.api.tasks({ id: task.id }).tackled.post({ id: task.id });
			expect(response.status).toBe(422);
		}

		const { data: features } = await client.api.tasks({ id: task.id }).tackled.get();
		expect(features).toMatchObject([]);
	});

	test("delete", async () => {
		const task = await create_task(client, status);
		const feature = await create_feature(client);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });
			expect(response.status).toBe(200);
		}
	
		{ // Delete
			const response = await client.api.features({ id: feature.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: features } = await client.api.tasks({ id: task.id }).tackled.get();
	
		expect(features).toMatchObject([]);
	});

	test("remove", async () => {
		const task = await create_task(client, status);
		const feature = await create_feature(client);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });
			expect(response.status).toBe(200);
		}
	
		{ // Remove
			const response = await client.api.tasks({ id: task.id }).tackled({ tid: feature.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: features } = await client.api.tasks({ id: task.id }).tackled.get();
	
		expect(features).toMatchObject([]);
	});
});

describe("Children", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const user = await create_user(client);
	const status = await create_status(client);

	test("add", async () => {
		const task = await create_task(client, status);
		const child_task = await create_task(client, status);
	
		const response = await client.api.tasks({ id: task.id }).children.post({ id: child_task.id });
	
		expect(response.status).toBe(200);
	
		const { data: tasks } = await client.api.tasks({ id: task.id }).children.get();
	
		expect(tasks).toMatchObject([{ id: child_task.id }]);
	});

	test("duplicate add", async () => {
		const task = await create_task(client, status);
		const child_task = await create_task(client, status);
	
		{ // First add
			const response = await client.api.tasks({ id: task.id }).children.post({ id: child_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Second add
			const response = await client.api.tasks({ id: task.id }).children.post({ id: child_task.id });
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).children.get();
	
		expect(tasks).toMatchObject([{ id: child_task.id }]);
	});

	test("add self", async () => {
		const task = await create_task(client, status);
		const child_task = await create_task(client, status);

		{
			const response = await client.api.tasks({ id: task.id }).children.post({ id: task.id });
			expect(response.status).toBe(500);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).children.get();
		expect(tasks).toMatchObject([]);
	});

	test("delete", async () => {
		const task = await create_task(client, status);
		const child_task = await create_task(client, status);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).children.post({ id: child_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Delete
			const response = await client.api.tasks({ id: child_task.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).children.get();
	
		expect(tasks).toMatchObject([]);
	});

	test("remove", async () => {
		const task = await create_task(client, status);
		const child_task = await create_task(client, status);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).children.post({ id: child_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Remove
			const response = await client.api.tasks({ id: task.id }).children({ cid: child_task.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).children.get();
	
		expect(tasks).toMatchObject([]);
	});
});

describe("Blockers", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	
	const client = treaty(server(db, eq));
	
	const user = await create_user(client);
	const status = await create_status(client);

	test("add", async () => {
		const task = await create_task(client, status);
		const blocker_task = await create_task(client, status);
	
		const response = await client.api.tasks({ id: task.id }).blockers.post({ id: blocker_task.id });
	
		expect(response.status).toBe(200);
	
		const { data: tasks } = await client.api.tasks({ id: task.id }).blockers.get();
	
		expect(tasks).toMatchObject([{ id: blocker_task.id }]);
	});

	test("duplicate add", async () => {
		const task = await create_task(client, status);
		const blocker_task = await create_task(client, status);
	
		{ // First add
			const response = await client.api.tasks({ id: task.id }).blockers.post({ id: blocker_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Second add
			const response = await client.api.tasks({ id: task.id }).blockers.post({ id: blocker_task.id });
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).blockers.get();
	
		expect(tasks).toMatchObject([{ id: blocker_task.id }]);
	});

	test("add self", async () => {
		const task = await create_task(client, status);
		const blocker_task = await create_task(client, status);

		{
			const response = await client.api.tasks({ id: task.id }).blockers.post({ id: task.id });
			expect(response.status).toBe(500);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).blockers.get();
		expect(tasks).toMatchObject([]);
	});

	test("delete", async () => {
		const task = await create_task(client, status);
		const blocker_task = await create_task(client, status);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).blockers.post({ id: blocker_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Delete
			const response = await client.api.tasks({ id: blocker_task.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).blockers.get();
	
		expect(tasks).toMatchObject([]);
	});

	test("remove", async () => {
		const task = await create_task(client, status);
		const blocker_task = await create_task(client, status);
	
		{ // Add
			const response = await client.api.tasks({ id: task.id }).blockers.post({ id: blocker_task.id });
			expect(response.status).toBe(200);
		}
	
		{ // Remove
			const response = await client.api.tasks({ id: task.id }).blockers({ bid: blocker_task.id }).delete();
			expect(response.status).toBe(200);
		}

		const { data: tasks } = await client.api.tasks({ id: task.id }).blockers.get();
	
		expect(tasks).toMatchObject([]);
	});
});

test.todo("Mention other object in channel message and add related");
test.todo("Send message in task channel");
test.todo("Check channel is deleted after deleting task");

test("Post update", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);
	const status = await create_status(client);

	const task = await create_task(client, status);

	{ // Check that the task starts with 0 progress and no updates
		const { data: task_g } = await client.api.tasks({ id: task.id }).get();
		expect(task_g.progress).toBe(0);
		const { data: updates } = await client.api.tasks({ id: task.id }).updates.get();
		expect(updates).toMatchObject([]);
	}

	{
		const response = await client.api.tasks({ id: task.id }).updates.post({ value: 10, note: "This is a test update", time_spent: 30 });
		expect(response.status).toBe(200);
	}

	{ // Check that the task has 10 progress and the one update
		const { data: task_g } = await client.api.tasks({ id: task.id }).get();
		expect(task_g.progress).toBe(10);
		const { data: updates } = await client.api.tasks({ id: task.id }).updates.get();
		expect(updates).toMatchObject([{ note: "This is a test update" }]);
	}

	{
		const response = await client.api.tasks({ id: task.id }).updates.post({ value: 30, note: "This is a test update", time_spent: 30 });
		expect(response.status).toBe(200);
	}

	{ // Check that the task has the lastest progress and the two updates
		const { data: task_g } = await client.api.tasks({ id: task.id }).get();
		expect(task_g.progress).toBe(30);
		const { data: updates } = await client.api.tasks({ id: task.id }).updates.get();
		expect(updates).toMatchObject([{ note: "This is a test update" }, { note: "This is a test update" }]);
	}

	{
		const response = await client.api.tasks({ id: task.id }).updates.post({ value: 20, note: "This is a test update", time_spent: 30 });
		expect(response.status).toBe(200);
	}

	{ // Check that the task has the lastest progress (note that it is smaller) and the three updates
		const { data: task_g } = await client.api.tasks({ id: task.id }).get();
		expect(task_g.progress).toBe(20);
		const { data: updates } = await client.api.tasks({ id: task.id }).updates.get();
		expect(updates).toMatchObject([{ note: "This is a test update" }, { note: "This is a test update" }, { note: "This is a test update" }]);
	}
});

describe("Update task", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const task = await create_task(client, status);

	test("title", async () => {
		const response = await client.api.tasks({ id: task.id }).patch({ title: "New Title" });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ title: "New Title" });
		}
	});

	test("body", async () => {
		const response = await client.api.tasks({ id: task.id }).patch({ body: "New Body" });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ body: "New Body" });
		}
	});

	test("priority", async () => {
		const response = await client.api.tasks({ id: task.id }).patch({ priority: "High" });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ priority: "High" });
		}
	});

	test("effort", async () => {
		const response = await client.api.tasks({ id: task.id }).patch({ effort: "Day" });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ effort: "Day" });
		}
	});

	test("value", async () => {
		const response = await client.api.tasks({ id: task.id }).patch({ value: "High" });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ value: "High" });
		}
	});

	test("assignee", async () => {
		const user = await create_user(client);

		const response = await client.api.tasks({ id: task.id }).patch({ assignee: user.id });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ assignee: { id: user.id } });
		}
	});

	test("status", async () => {
		const new_status = await create_status(client);

		const response = await client.api.tasks({ id: task.id }).patch({ status: new_status.id });

		expect(response.status).toBe(200);

		{
			const { data: task_g } = await client.api.tasks({ id: task.id }).get();
			expect(task_g).toMatchObject({ status: { id: new_status.id } });
		}
	});

	describe("labels", async () => {
		test("add", async () => {
			const label = await create_label(client);

			const response = await client.api.tasks({ id: task.id }).patch({ labels: [{ id: label.id }] });

			expect(response.status).toBe(200);

			{
				const { data: task_g } = await client.api.tasks({ id: task.id }).get();
				expect(task_g).toMatchObject({ labels: [{ id: label.id }] });
			}
		});

		test("remove", async () => {
			const label = await create_label(client);

			await client.api.tasks({ id: task.id }).patch({ labels: [{ id: label.id }] });

			const response = await client.api.tasks({ id: task.id }).patch({ labels: [] });

			expect(response.status).toBe(200);

			{
				const { data: task_g } = await client.api.tasks({ id: task.id }).get();
				expect(task_g).toMatchObject({ labels: [] });
			}
		});
	});
});
