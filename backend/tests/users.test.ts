import { expect, test } from "bun:test";

import { Elysia } from 'elysia';
import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";

const api = treaty(server);

test("Create user successfully", async () => {
	const response = await api.api.users.post({ email: "fvilla@netnix.net", full_name: "Facundo Villa" });

	expect(response.status).toBe(200);
});
