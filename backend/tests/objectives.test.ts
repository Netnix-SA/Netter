import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_project, create_status, log_error } from "./utils";

test("Create objective succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const status = await create_status(api);
	const project = await create_project(api, status);

	const response = await api.api.projects({ id: project.id }).objectives.post({ title: "Test Objective", description: "This is a test objective", });

	expect(response.status).toBe(200);

	const project_response = await api.api.projects({ id: project.id }).objectives.get();

	expect(project_response.status).toBe(200);
	expect(project_response.data).toMatchObject([{ title: "Test Objective", description: "This is a test objective" }]);
});