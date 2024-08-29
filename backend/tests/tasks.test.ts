import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_project, create_status, create_user } from "./utils";

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

test("Close task as resolved", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const { data: start_status } = await api.api.statuses.post({ state: "Backlog", name: "Backlog", });
	const project = await create_project(api, start_status);
	const { data: status } = await api.api.projects({ id: project.id }).statuses.post({ state: "Resolved", name: "Resolved", });
	const { data: task } = await api.api.projects({ id: project.id }).tasks.post({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", assignee: null, status: start_status.id });

	const response = await api.api.tasks({ id: task.id }).delete({ id: status.id, note: "This task was completed!" });

	expect(response.status).toBe(200);

	const closed_task = await api.api.tasks({ id: task.id }).get();

	expect(closed_task.status).toBe(200);
	expect(closed_task.data).toMatchObject({ status: { id: status.id, closed_as: "Resolved", note: "This task was completed!" } });
});
