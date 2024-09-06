import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_product } from "./utils";

test("Create component succesfully", async () => {
	const db = await create_db();

	const api = treaty(server(db));

	const response = await api.api.components.post({ name: "Test Component", description: "This is a test component", type: "Other" });

	expect(response.status).toBe(200);

	// TODO: test can get
});