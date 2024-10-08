import { expect, test, describe } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_product } from "./utils";
import { LocalEvents } from "../src/events";

test("Create product succesfully", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const response = await client.api.products.post({ name: "Test Product", description: "This is a test product", });

	expect(response.status).toBe(200);

	if (response.data === null) { throw new Error("Response data is null"); }

	const product_response = await client.api.products({ id: response.data.id }).get();

	expect(product_response.status).toBe(200);
	expect(product_response.data).toMatchObject({ name: "Test Product", description: "This is a test product" });
});

test("Create feature succesfully", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const product = await create_product(client);

	const response = await client.api.products({ id: product.id }).features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

	expect(response.status).toBe(200);

	const feature_response = await client.api.products({ id: product.id }).features.get();

	expect(feature_response.status).toBe(200);
	expect(feature_response.data).toMatchObject([{ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" }]);
});

test.todo("Get related projects");

describe("Update product", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const product = await create_product(client);

	test("name", async () => {
		const response = await client.api.products({ id: product.id }).patch({ name: "New name" });

		expect(response.status).toBe(200);

		{
			const { data: product_g } = await client.api.products({ id: product.id }).get();
			expect(product_g.name).toBe("New name");
		}
	});

	test("description", async () => {
		const response = await client.api.products({ id: product.id }).patch({ description: "New description" });

		expect(response.status).toBe(200);

		{
			const { data: product_g } = await client.api.products({ id: product.id }).get();
			expect(product_g.description).toBe("New description");
		}
	});
});

test("Get product features", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const product = await create_product(client);

	{
		const response = await client.api.products({ id: product.id }).features.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([]);
	}

	await client.api.products({ id: product.id }).features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

	{
		const response = await client.api.products({ id: product.id }).features.get();
		expect(response.status).toBe(200);
		expect(response.data).toMatchObject([{ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" }]);
	}
});

describe("Delete", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));
	
	test("product", async () => {
		const product = await create_product(client);
		const response = await client.api.products({ id: product.id }).delete();

		expect(response.status).toBe(200);

		{
			const response = await client.api.products({ id: product.id }).get();
			expect(response.status).toBe(404);
		}
	});

	test("product with features", async () => {
		const product = await create_product(client);
		const { data: feature } = await client.api.products({ id: product.id }).features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

		const response = await client.api.products({ id: product.id }).delete();

		expect(response.status).toBe(200);

		{
			const response = await client.api.products({ id: product.id }).get();
			expect(response.status).toBe(404);
		}

		{
			const response = await client.api.features({ id: feature.id }).get();
			expect(response.status).toBe(404);
		}
	});

	test("non-existent product", async () => {
		const response = await client.api.products({ id: "Product:2a6s7w8e9b1x3a4k9e2p" }).delete();

		expect(response.status).toBeOneOf([200, 404]);
	});

	test("already deleted product", async () => {
		const product = await create_product(client);
		await client.api.products({ id: product.id }).delete();

		const response = await client.api.products({ id: product.id }).delete();

		expect(response.status).toBeOneOf([200, 404]);
	});

	test.todo("product related to tasks");
});