import { expect, describe, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_project, create_status, create_user } from "./utils";

test("Create project succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const { data: status } = await api.api.statuses.post({ state: "Backlog", name: "Backlog", });
	const response = await api.api.projects.post({ name: "Test Project", description: "This is a test project", lead: null, members: [], client: null, end: null });

	expect(response.status).toBe(200);

	const project_response = await api.api.projects({ id: response.data.id }).get();

	expect(project_response.status).toBe(200);
	expect(project_response.data).toMatchObject({});
});

describe("Members", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const status = await create_status(api);
	const project = await create_project(api, status);

	test("Add member", async () => {
		const user = await create_user(api);

		const response = await api.api.projects({ id: project.id }).members.post({ id: user.id });

		expect(response.status).toBe(200);

		const project_response = await api.api.projects({ id: project.id }).get();

		expect(project_response.status).toBe(200);
		expect(project_response.data.members).toMatchObject([{ id: user.id }]);
	});
});

test("Post update succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const status = await create_status(api);
	const project = await create_project(api, status);

	const response = await api.api.projects({ id: project.id }).updates.post({ title: "Test Objective", body: "This is a test objective", });

	expect(response.status).toBe(200);

	const project_response = await api.api.projects({ id: project.id }).get();

	expect(project_response.status).toBe(200);
	expect(project_response.data.updates).toMatchObject([{ title: "Test Objective", body: "This is a test objective" }]);
});

test.todo("Add project milestione");
test.todo("Update project lead and status");
