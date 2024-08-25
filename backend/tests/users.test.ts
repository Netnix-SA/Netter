import { expect, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import Surreal from "surrealdb";

test("Create user successfully", async () => {
	const db = new Surreal();

	await db.connect("http://db:8000/rpc", {
		auth: {
			username: "root",
			password: "root",
		},
		namespace: "development",
		database: `test-${Date.now()}`,
	});

	const api = treaty(server(db));

	const response = await api.api.users.post({ email: "fvilla@netnix.net", full_name: "Facundo Villa" });

	expect(response.status).toBe(200);

	const users = await api.api.users.get();

	expect(users.status).toBe(200);
	expect(users.data).toHaveLength(1);
	users.data.forEach(user => {
		expect(user.email).toBe("fvilla@netnix.net");
		expect(user.handle).toBe("fvilla");
	});
});
