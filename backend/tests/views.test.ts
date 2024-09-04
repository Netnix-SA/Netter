import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db } from "./utils";

test("Create view", async () => {
	const db = await create_db();

	const client = treaty(server(db));

	const response = await client.api.views.post({ name: "Test View", filters: [] });

	expect(response.status).toBe(200);

	const { data: views } = await client.api.views.get();

	expect(views).toMatchObject([{ name: "Test View", filters: [] }]);
});