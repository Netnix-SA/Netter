import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_product } from "./utils";

test("Create feature succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const product = await create_product(api);

	const response = await api.api.products({ id: product.id }).features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

	expect(response.status).toBe(200);

	const feature_response = await api.api.products({ id: product.id }).features.get();

	expect(feature_response.status).toBe(200);
	expect(feature_response.data).toMatchObject([{ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" }]);
});

test.todo("Get related applications");
test.todo("Get related projects");
test.todo("Update product description and title");

test.todo("Get product features");
test.todo("Add product feature");
