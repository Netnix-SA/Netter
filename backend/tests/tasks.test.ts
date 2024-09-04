import { expect, describe, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_feature, create_project, create_status, create_task, create_user } from "./utils";

test("Create task", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const user = await create_user(api);
	const status = await create_status(api);

	const response = await api.api.tasks.post({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", assignee: null, status: status.id });

	expect(response.status).toBe(200);

	const { data: task } = await api.api.tasks({ id: response.data.id }).get();

	expect(task).toMatchObject({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", });
});

describe("Close task", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const status = await create_status(api);
	const project = await create_project(api, status);
	const { data: resolved_status } = await api.api.projects({ id: project.id }).statuses.post({ state: "Resolved", name: "Resolved", });

	test("as resolved", async () => {
		const task = await create_task(api, status);
	
		const response = await api.api.tasks({ id: task.id }).delete({ id: status.id, close_as: "Resolved", note: "This task was completed!" });
	
		expect(response.status).toBe(200);
	
		const closed_task = await api.api.tasks({ id: task.id }).get();
	
		expect(closed_task.status).toBe(200);
		expect(closed_task.data).toMatchObject({ status: { id: status.id, closed_as: "Resolved", note: "This task was completed!" } });
	});

	test("as duplicate", async () => {
		const task = await create_task(api, status);
		const duplicate_task = await create_task(api, status);
	
		const response = await api.api.tasks({ id: duplicate_task.id }).delete({ id: status.id, close_as: "Duplicate", original: task.id });

		const closed_task = await api.api.tasks({ id: duplicate_task.id }).get();

		expect(closed_task.status).toBe(200);
		expect(closed_task.data).toMatchObject({ status: { id: status.id, closed_as: "Duplicate", original: task.id } });
	});

	test("as canceled", async () => {
		const task = await create_task(api, status);
	
		const response = await api.api.tasks({ id: task.id }).delete({ id: status.id, close_as: "Cancelled", note: "This task was canceled!" });
	
		expect(response.status).toBe(200);
	
		const closed_task = await api.api.tasks({ id: task.id }).get();

		expect(closed_task.status).toBe(200);
		expect(closed_task.data).toMatchObject({ status: { id: status.id, closed_as: "Cancelled", note: "This task was canceled!" } });
	});
});

test("Add related task", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const user = await create_user(api);
	const status = await create_status(api);

	const task = await create_task(api, status);
	const related_task = await create_task(api, status);

	const response = await api.api.tasks({ id: task.id }).related.post({ id: related_task.id });

	expect(response.status).toBe(200);

	const { data: tasks } = await api.api.tasks({ id: task.id }).related.get();

	expect(tasks).toMatchObject([{ id: related_task.id }]);
});

test("Add tackled feature", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const user = await create_user(api);
	const status = await create_status(api);

	const task = await create_task(api, status);
	const feature = await create_feature(api);

	const response = await api.api.tasks({ id: task.id }).tackled.post({ id: feature.id });

	expect(response.status).toBe(200);

	const { data: features } = await api.api.tasks({ id: task.id }).tackled.get();

	expect(features).toMatchObject([{ id: feature.id }]);
});

test("Add children task", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const user = await create_user(api);
	const status = await create_status(api);

	const task = await create_task(api, status);
	const child_task = await create_task(api, status);

	const response = await api.api.tasks({ id: task.id }).children.post({ id: child_task.id });

	expect(response.status).toBe(200);

	const { data: tasks } = await api.api.tasks({ id: task.id }).children.get();

	expect(tasks).toMatchObject([{ id: child_task.id }]);
});

test("Add blockers task", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const user = await create_user(api);
	const status = await create_status(api);

	const task = await create_task(api, status);
	const blocker_task = await create_task(api, status);

	const response = await api.api.tasks({ id: task.id }).blockers.post({ id: blocker_task.id });

	expect(response.status).toBe(200);

	const { data: tasks } = await api.api.tasks({ id: task.id }).blockers.get();

	expect(tasks).toMatchObject([{ id: blocker_task.id }]);
});

test.todo("Mention other object in channel message and add related");
test.todo("Send message in task channel");