import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_product } from "./utils";
import { MemoryEvents } from "../src/events";

test("Create component succesfully", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const response = await client.api.components.post({ name: "Test Component", description: "This is a test component", type: "Other" });

	expect(response.status).toBe(200);

	// TODO: test can get
});