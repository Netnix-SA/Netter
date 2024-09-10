import { expect, test, describe } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_bug, create_component, create_db, create_feature, create_status, create_task, log_error } from "./utils";
import { MemoryEvents } from "../src/events";

test("Create feature succesfully", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const response = await client.api.features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

	expect(response.status).toBe(200);
});

test("Get execution stats", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const feature = await create_feature(client);

	{
		const response = await client.api.features({ id: feature.id }).statistics.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject({ tasks: { total: 0 }, bugs: { total: 0 }, });
	}

	const status = await create_status(client);
	const task_a = await create_task(client, status);

	await client.api.tasks({ id: task_a.id }).tackled.post({ id: feature.id });

	await client.api.tasks({ id: task_a.id }).updates.post({ value: 50, note: "Halfway there", time_spent: 60 });

	{
		const response = await client.api.features({ id: feature.id }).statistics.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject({
			tasks: {
				total: 1,
				time: {
					total: 1, // 1 hour
					executed: 0.5, // 50% of 1 hour
					real: 1, // 60 minutes
				},
				completion: 50, // 50% of executed time
			},
			bugs: { total: 0 },
		});
	}

	const task_b = await create_task(client, status);

	await client.api.tasks({ id: task_b.id }).tackled.post({ id: feature.id });

	await client.api.tasks({ id: task_b.id }).updates.post({ value: 50, note: "Halfway there", time_spent: 360 });

	{
		const response = await client.api.features({ id: feature.id }).statistics.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject({
			tasks: {
				total: 2,
				time: {
					total: 2, // 2 hours
					executed: 1, // 50% of 1 hour + 50% of 1 hours
					real: 7, // 60 minutes + 360 minutes
				},
				completion: 50, // 50% of executed time
			},
			bugs: { total: 0 },
		});
	}
});

test("Get tackling tasks", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const feature = await create_feature(client);

	{
		const response = await client.api.features({ id: feature.id }).tasks.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([]);
	}

	const status = await create_status(client);
	const task = await create_task(client, status);

	await client.api.tasks({ id: task.id }).tackled.post({ id: feature.id });

	{
		const response = await client.api.features({ id: feature.id }).tasks.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([{ id: task.id }]);
	}
});

test("Get related components", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const feature = await create_feature(client);

	{
		const response = await client.api.features({ id: feature.id }).components.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([]);
	}

	const component = await create_component(client);

	await client.api.features({ id: feature.id }).needs.post({ id: component.id });

	{
		const response = await client.api.features({ id: feature.id }).components.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([{ id: component.id }]);
	}
});

test("Get related bugs", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const feature = await create_feature(client);

	{
		const response = await client.api.features({ id: feature.id }).bugs.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([]);
	}

	const bug = await create_bug(client);

	await client.api.bugs({ id: bug.id }).impact.post({ id: feature.id });

	{
		const response = await client.api.features({ id: feature.id }).bugs.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([{ id: bug.id }]);
	}
});

describe("Update feature", async () => {
	const db = await create_db(); const eq = new MemoryEvents();
	const client = treaty(server(db, eq));

	const feature = await create_feature(client);

	{
		const response = await client.api.features({ id: feature.id }).patch({ name: "Updated Test Feature", description: "This is an updated test feature", constraints: "", notes: "", value: "Low" });
		expect(response.status).toBe(200);
	}
});
