import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, log_error } from "./utils";
import { MemoryEvents } from "../src/events";

test("Create bug", async () => {
	const db = await create_db(); const eq = new MemoryEvents();

	const client = treaty(server(db, eq));

	const response = await client.api.bugs.post({ title: "Test Bug", description: "This is a test bug", });

	expect(response.status).toBe(200);

	const { data: bugs, error } = await client.api.bugs.get();

	expect(bugs).toMatchObject([{ title: "Test Bug", description: "This is a test bug", resolved: false, }]);

	expect(await eq.get("BUG_CREATED")).toHaveLength(1);
});