import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_feature, create_objective, create_project, create_status, log_error } from "./utils";

test("Create objective succesfully", async () => {
	const db = await create_db();

	const client = treaty(server(db));

	const status = await create_status(client);
	const project = await create_project(client, status);

	const response = await client.api.projects({ id: project.id }).objectives.post({ title: "Test Objective", description: "This is a test objective", });

	expect(response.status).toBe(200);

	const project_response = await client.api.projects({ id: project.id }).objectives.get();

	expect(project_response.status).toBe(200);
	expect(project_response.data).toMatchObject([{ title: "Test Objective", description: "This is a test objective" }]);
});

test("Add slated feature", async () => {
	const db = await create_db();

	const client = treaty(server(db));

	const status = await create_status(client);
	const project = await create_project(client, status);
	const objective = await create_objective(client, project);
	const feature = await create_feature(client);

	const feature_response = await client.api.objectives({ id: objective.id }).slated.post({ id: feature.id });

	expect(feature_response.status).toBe(200);

	const features_response = await client.api.objectives({ id: objective.id }).features.get();

	expect(features_response.status).toBe(200);
	expect(features_response.data).toMatchObject([{ name: "Test Feature", description: "This is a test feature" }]);
});

test.todo("Get completion stats");
test.todo("Get tasks");
test.todo("Change active objective");
