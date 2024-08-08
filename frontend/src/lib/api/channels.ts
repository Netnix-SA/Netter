import { db } from "@/server/db";
import type { Channel, Message } from "@/server/db/types";
import Elysia, { t } from "elysia";
import { tChannel, tChannelPost, tMessage, tMessagePost } from "./schemas";
import { RecordId, StringRecordId, surql } from "surrealdb";

export const channels = new Elysia({ prefix: "/channels", detail: { tags:["Channels"], description: "Channels manage all chat-like things in Netter." }})

.get("", async () => {
	const channels = await db.select<Channel>("Channel");

	return channels.map(({ id, name }) => ({
		id: id.toString(),
		name,
	}));
}, {
	response: t.Array(t.Any()),
	detail: {
		description: "Returns all channels under the querying user's organization.",
	},
})

.post("", async ({ body: { name, } }) => {
	await db.create<Omit<Channel, "id">>("Channel", {
		name,
		subscribers: [],
	});
}, {
	body: tChannelPost,
	detail: {
		description: "Creates a channel with the querying user as subscriber.",
	},
})

.get("/:id", async ({ params: { id: channel_id } }) => {
	const { id, name, subscribers } = await db.select<Channel>(new StringRecordId(channel_id));

	return {
		id: id.toString(),
		name,
		subscribers: subscribers.map(({ user }) => user.toString()),
	};
}, {
	response: tChannel,
	detail: {
		description: "Returns all channels under the querying user's organization.",
	},
})

.post("/:id/messages", async ({ params: { id }, body: { body, } }) => {
	const channel_id = new StringRecordId(id);

	await db.create<Omit<Message, "id">>("Message", {
		body,
		channel: channel_id as unknown as RecordId<"Channel">,
		author: new RecordId("User", "63fuy0gytwazm2079qeh"),
		date: new Date(),
	});
}, {
	body: tMessagePost,
	detail: {
		description: "Posts a message to a channel with the querying user as author.",
	},
})

.get("/:id/messages", async ({ params: { id } }) => {
	const channel_id = new StringRecordId(id);

	const results = await db.query<[Message[]]>(surql`SELECT * FROM Message WHERE channel == ${channel_id} ORDER BY date ASC;`);

	const messages = results[0];

	return messages.map(({ id, body, author, date}) => ({
		id: id.toString(),
		body, author: author.toString(),
		date,
	}));
}, {
	response: t.Array(tMessage),
	detail: {
		description: "Returns all messages for the channel.",
	},
});