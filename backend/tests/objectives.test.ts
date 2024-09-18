import { describe, expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_feature, create_objective, create_project, create_status, create_task, log_error } from "./utils";
import { MemoryEvents } from "../src/events";

test("Create objective succesfully", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);

	const response = await client.api.projects({ id: project.id }).objectives.post({ title: "Test Objective", description: "This is a test objective", end: null });

	expect(response.status).toBe(200);

	const project_response = await client.api.projects({ id: project.id }).objectives.get();

	expect(project_response.status).toBe(200);
	expect(project_response.data).toMatchObject([{ title: "Test Objective", description: "This is a test objective", end: null }]);
});

describe("Slated features", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);
	const objective = await create_objective(client, project);
	const feature = await create_feature(client);

	test("add", async () => {
		const feature_response = await client.api.objectives({ id: objective.id }).slated.post({ id: feature.id });
	
		expect(feature_response.status).toBe(200);
	
		const features_response = await client.api.objectives({ id: objective.id }).features.get();
	
		expect(features_response.status).toBe(200);
		expect(features_response.data).toMatchObject([{ name: "Test Feature", description: "This is a test feature" }]);
	});

	test("duplicate add", async () => {
		const feature_response = await client.api.objectives({ id: objective.id }).slated.post({ id: feature.id });
	
		expect(feature_response.status).toBe(200);
	
		const features_response = await client.api.objectives({ id: objective.id }).features.get();
	
		expect(features_response.status).toBe(200);
		expect(features_response.data).toMatchObject([{ name: "Test Feature", description: "This is a test feature" }]);
	});

	test("remove", async () => {
		const feature_response = await client.api.objectives({ id: objective.id }).slated({ sid: feature.id }).delete();
	
		expect(feature_response.status).toBe(200);
	
		const features_response = await client.api.objectives({ id: objective.id }).features.get();
	
		expect(features_response.status).toBe(200);
		expect(features_response.data).toMatchObject([]);
	});
});

test("Get execution stats", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);
	const objective = await create_objective(client, project);

	const feature = await create_feature(client);

	await client.api.objectives({ id: objective.id }).slated.post({ id: feature.id });

	{
		const response = await client.api.features({ id: feature.id }).statistics.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject({ tasks: { total: 0 }, bugs: { total: 0 }, });
	}

	const task_a = await create_task(client, status);

	await client.api.tasks({ id: task_a.id }).tackled.post({ id: feature.id });

	await client.api.tasks({ id: task_a.id }).updates.post({ value: 50, note: "Halfway there", time_spent: 60 });

	{
		const response = await client.api.objectives({ id: objective.id }).statistics.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject({
			features: {
				total: 1,
			},
			tasks: {
				total: 1,
				time: {
					total: 1, // 1 hour
					executed: 0.5, // 50% of 1 hour
					real: 1, // 60 minutes
				},
				completion: 50, // 50% of executed time
			},
		});
	}

	const task_b = await create_task(client, status);

	await client.api.tasks({ id: task_b.id }).tackled.post({ id: feature.id });

	await client.api.tasks({ id: task_b.id }).updates.post({ value: 50, note: "Halfway there", time_spent: 360 });

	{
		const response = await client.api.objectives({ id: objective.id }).statistics.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject({
			features: {
				total: 1,
			},
			tasks: {
				total: 2,
				time: {
					total: 2, // 2 hours
					executed: 1, // 50% of 1 hour + 50% of 1 hours
					real: 7, // 60 minutes + 360 minutes
				},
				completion: 50, // 50% of executed time
			},
		});
	}
});

test("Get tasks", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const status = await create_status(client);
	const project = await create_project(client, status);
	const objective = await create_objective(client, project);

	{
		const response = await client.api.objectives({ id: objective.id }).tasks.get();
	
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([]);
	}

	const feature = await create_feature(client);

	const task = await create_task(client, status);

	await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });

	{
		const response = await client.api.objectives({ id: objective.id }).tasks.get();
	
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([]);
	}

	await client.api.objectives({ id: objective.id }).slated.post({ id: feature.id });

	{
		const response = await client.api.objectives({ id: objective.id }).tasks.get();
	
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([{ id: task.id }]);
	}
});

test.todo("Change active objective");
