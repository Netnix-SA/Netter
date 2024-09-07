import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db } from "./utils";
import { LocalEvents } from "../src/events";

test("Create status", async () => {
	const db = await create_db(); const eq = new LocalEvents();

	const client = treaty(server(db, eq));

	const response = await client.api.statuses.post({ name: "Test Status", state: "Backlog" });

	expect(response.status).toBe(200);

	const { data: statuses } = await client.api.statuses.get();

	expect(statuses).toMatchObject([{ name: "Test Status", state: "Backlog" }]);
});

test.todo("Update status");

test.todo("Delete status with no references");
test.todo("Delete status with references");