import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_product } from "./utils";

test("Create feature succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const response = await api.api.features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });

	expect(response.status).toBe(200);
});