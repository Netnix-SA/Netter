import { expect, describe, test } from "bun:test";

import { treaty } from '@elysiajs/eden';
import { server } from "../src/api";
import { create_db, create_feature, create_project, create_status, create_task, create_user } from "./utils";
import { LocalEvents } from "../src/events";

test("Get messages by author", async () => {
	const db = await create_db(); const eq = new LocalEvents();

	const client_a = treaty(server(db));
	const client_b = treaty(server(db));

	const user_a = await create_user(client_a);
	const user_b = await create_user(client_b);

	const { data: channel } = await client_a.api.channels.post({ name: "Test Channel" });

	if (!channel) { throw new Error("Channel not created"); }

	const response = await client_a.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: false });

	expect(response.status).toBe(200);

	const { data: messages } = await client_a.api.messages.get({ query: { author: user_a.id } });

	expect(messages).toMatchObject([{ body: "Test message" }]);

	const { data: messages_b } = await client_a.api.messages.get({ query: { author: user_b.id } });

	expect(messages_b).toMatchObject([]);
});

test.todo("Get unresolved messages", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);

	const { data: channel } = await client.api.channels.post({ name: "Test Channel" });

	if (!channel) { throw new Error("Channel not created"); }

	await client.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: false });
	const response = await client.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: true });

	expect(response.status).toBe(200);

	const { data: messages } = await client.api.messages.get({ query: { resolved: true } });

	expect(messages).toMatchObject([{ body: "Test message", resolved: true }]);
});

test.todo("Get messages with mentions", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);

	const { data: channel } = await client.api.channels.post({ name: "Test Channel" });

	if (!channel) { throw new Error("Channel not created"); }

	const { data: non_mention_message } = await client.api.channels({ id: channel.id }).messages.post({ body: `Non mention`, is_inquiry: false });
	const { data: message } = await client.api.channels({ id: channel.id }).messages.post({ body: `Hello @${user.id}`, is_inquiry: false });

	if (!message) { throw new Error("Message not created"); }

	const { data: messages } = await client.api.messages.get({ query: { was_mentioned: true } });

	expect(messages).toMatchObject([{ body: `Hello @${user.id}` }]);
});

describe("Get parent", async () => {
	const db = await create_db(); const eq = new LocalEvents();
	const client = treaty(server(db, eq));

	const user = await create_user(client);

	test("channel", async () => {
		const { data: channel } = await client.api.channels.post({ name: "Test Channel" });

		if (!channel) { throw new Error("Channel not created"); }

		const response = await client.api.channels({ id: channel.id }).messages.post({ body: "Test message", is_inquiry: false });

		expect(response.status).toBe(200);

		const { data: parent } = await client.api.messages({ id: response.data.id }).parent.get();

		if (!parent) { throw new Error("Parent not found"); }

		expect(parent.id).toMatch(channel.id);
	});

	test.todo("task");
});
