import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db } from "./utils";

test("Create label", async () => {
	const db = await create_db();

	const client = treaty(server(db));

	const response = await client.api.labels.post({ title: "Test Label", color: "Green/Light", icon: null });

	expect(response.status).toBe(200);

	const { data: labels } = await client.api.labels.get();

	expect(labels).toMatchObject([{ title: "Test Label", color: "Green/Light", icon: null }]);
});

test.todo("Update label");

test.todo("Delete label with no references");
test.todo("Delete label with references");