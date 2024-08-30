import { expect, test, describe } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_status, create_task, create_user } from "./utils";

test("Create user successfully", async () => {
	const db = await create_db();

	const app = server(db);
	const api = treaty(app, { fetch: { credentials: "include" } });

	const response = await api.api.users.post({ email: "fvilla@netnix.net", full_name: "Facundo Villa" });

	expect(response.status).toBe(200);

	const re = await api.api.auth.token.post({ email: "fvilla@netnix.net" });

	const users = await api.api.users.get();

	expect(users.status).toBe(200);
	expect(users.data).toHaveLength(1);
	users.data.forEach(user => {
		expect(user.email).toBe("fvilla@netnix.net");
		expect(user.handle).toBe("fvilla");
	});
});

describe("Pins", async () => {
	const db = await create_db();

	const app = server(db);
	const api = treaty(app, { fetch: { credentials: "include" } });

	const user = await create_user(api);
	const status = await create_status(api);
	const task = await create_task(api, status);

	test("Pin item", async () => {
		const response = await api.api.users.me.pins.post({ id: task.id });

		expect(response.status).toBe(200);

		const pins_response = await api.api.users.me.pins.get();

		expect(pins_response.status).toBe(200);
		expect(pins_response.data).toHaveLength(1);
		pins_response.data.forEach(pin => {
			expect(pin.id).toBe(task.id);
		});
	});

	test("Unpin item", async () => {
		const response = await api.api.users.me.pins({ id: task.id }).delete();

		expect(response.status).toBe(200);

		const pins_response = await api.api.users.me.pins.get();

		expect(pins_response.status).toBe(200);
		expect(pins_response.data).toHaveLength(1);
		pins_response.data.forEach(pin => {
			expect(pin.id).toBe(task.id);
		});
	});

	test("Delete non-existent pin", async () => {
		const response = await api.api.users.me.pins({ id: task.id }).delete();

		expect(response.status).toBe(404);
	});

	test("Double pin item", async () => {
		await api.api.users.me.pins.post({ id: task.id });
		await api.api.users.me.pins.post({ id: task.id });

		const pins_response = await api.api.users.me.pins.get();

		expect(pins_response.status).toBe(200);
		expect(pins_response.data).toHaveLength(1);
		pins_response.data.forEach(pin => {
			expect(pin.id).toBe(task.id);
		});
	});
});
