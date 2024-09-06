import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_bug, create_db, create_feature, create_product, create_status, create_task, log_error } from "./utils";

test("Create feature succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const response = await api.api.features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

	expect(response.status).toBe(200);
});

test.todo("Get execution stats");

test("Get tackling tasks", async () => {
	const db = await create_db();
	const client = treaty(server(db));

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

test.todo("Get related components");

test("Get related bugs", async () => {
	const db = await create_db();
	const client = treaty(server(db));

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
