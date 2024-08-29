import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db } from "./utils";

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
