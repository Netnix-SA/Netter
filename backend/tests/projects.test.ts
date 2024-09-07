import { expect, describe, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_project, create_status, create_user } from "./utils";
import { LocalEvents } from "../src/events";

test("Create project succesfully", async () => {
	const db = await create_db(); const eq = new LocalEvents();

	const client = treaty(server(db, eq));

	const { data: status } = await client.api.statuses.post({ state: "Backlog", name: "Backlog", });
	const response = await client.api.projects.post({ name: "Test Project", description: "This is a test project", lead: null, members: [], client: null, end: null });

	expect(response.status).toBe(200);

	const project_response = await client.api.projects({ id: response.data.id }).get();

	expect(project_response.status).toBe(200);
	expect(project_response.data).toMatchObject({});
});

describe("Members", async () => {
	const db = await create_db(); const eq = new LocalEvents();

	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);

	test("Add member", async () => {
		const user = await create_user(client);

		const response = await client.api.projects({ id: project.id }).members.post({ id: user.id });

		expect(response.status).toBe(200);

		const project_response = await client.api.projects({ id: project.id }).get();

		expect(project_response.status).toBe(200);
		expect(project_response.data.members).toMatchObject([{ id: user.id }]);
	});
});

describe("Project updates", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);

	test("post", async () => {
		const response = await client.api.projects({ id: project.id }).updates.post({ title: "Test Update", body: "This is a test update", });

		expect(response.status).toBe(200);

		const project_response = await client.api.projects({ id: project.id }).get();

		expect(project_response.status).toBe(200);
		expect(project_response.data.updates).toMatchObject([{ title: "Test Update", body: "This is a test update" }]);
	});
});

describe("Project milestones", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);

	test("create", async () => {
		const response = await client.api.projects({ id: project.id }).milestones.post({ title: "Test Milestone", description: "This is a test milestone", });

		expect(response.status).toBe(200);

		const project_response = await client.api.projects({ id: project.id }).milestones.get();

		expect(project_response.status).toBe(200);
		expect(project_response.data).toMatchObject([{ title: "Test Milestone", description: "This is a test milestone" }]);
	});

	// test("Update milestone", async () => {
	// 	const milestone = await client.api.projects({ id: project.id }).milestones.post({ title: "Test Milestone", description: "This is a test milestone", });

	// 	const response = await client.api.projects({ id: project.id }).milestones({ id: milestone.data.id }).patch({ title: "New Title" });

	// 	expect(response.status).toBe(200);

	// 	const project_response = await client.api.projects({ id: project.id }).milestones.get();

	// 	expect(project_response.status).toBe(200);
	// 	expect(project_response.data).toMatchObject([{ title: "New Title", description: "This is a test milestone" }]);
	// });
});

describe("Update project", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);

	test("name", async () => {
		const response = await client.api.projects({ id: project.id }).patch({ name: "New Name" });

		expect(response.status).toBe(200);

		{
			const { data: project_g } = await client.api.projects({ id: project.id }).get();
			expect(project_g.name).toBe("New Name");
		}
	});

	test("description", async () => {
		const response = await client.api.projects({ id: project.id }).patch({ description: "New Description" });

		expect(response.status).toBe(200);

		{
			const { data: project_g } = await client.api.projects({ id: project.id }).get();
			expect(project_g.description).toBe("New Description");
		}
	});

	test("lead", async () => {
		const user = await create_user(client);

		const response = await client.api.projects({ id: project.id }).patch({ lead: user.id });

		expect(response.status).toBe(200);

		{
			const { data: project_g } = await client.api.projects({ id: project.id }).get();
			expect(project_g.lead).toMatchObject({ id: user.id });
		}
	});

	test("end", async () => {
		const end = new Date();
		const response = await client.api.projects({ id: project.id }).patch({ end });

		expect(response.status).toBe(200);

		{
			const { data: project_g } = await client.api.projects({ id: project.id }).get();
			expect(project_g.end).toBe(end.toISOString());
		}
	});

	test("status", async () => {
		const status = await create_status(client);

		const response = await client.api.projects({ id: project.id }).patch({ status: { id: status.id } });

		expect(response.status).toBe(200);

		{
			const { data: project_g } = await client.api.projects({ id: project.id }).get();
			expect(project_g.status).toMatchObject({ id: status.id });
		}
	});
});
