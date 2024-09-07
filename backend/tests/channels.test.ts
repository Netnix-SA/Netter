import { expect, describe, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_feature, create_project, create_status, create_task, create_user } from "./utils";
import { LocalEvents } from "../src/events";

test("Send message", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);

	const { data: channel } = await client.api.channels.post({ name: "Test Channel" });

	if (!channel) {
		throw new Error("Channel not created");
	}

	const response = await client.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: false });

	expect(response.status).toBe(200);

	const { data: messages } = await client.api.channels({ id: channel.id }).messages.get();

	expect(messages).toMatchObject([{ body: "Test message" }]);
});

test("Send inquiry", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);

	const { data: channel } = await client.api.channels.post({ name: "Test Channel" });

	if (!channel) {
		throw new Error("Channel not created");
	}

	const response = await client.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: true });

	expect(response.status).toBe(200);

	const { data: messages } = await client.api.channels({ id: channel.id }).messages.get();

	expect(messages).toMatchObject([{ body: "Test message", resolved: false }]);
});

test("Resolve inquiry", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);

	const { data: channel } = await client.api.channels.post({ name: "Test Channel" });

	if (!channel) {
		throw new Error("Channel not created");
	}

	const { data: message } = await client.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: true });

	if (!message) {
		throw new Error("Message not created");
	}

	const response = await client.api.messages({ id: message.id }).patch({ resolved: true });

	expect(response.status).toBe(200);

	const { data: messages } = await client.api.channels({ id: channel.id }).messages.get();

	expect(messages).toMatchObject([{ body: "Test message", resolved: true }]);
});

test.todo("Send message as non member");

test.todo("Test mentions");
