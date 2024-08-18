import { db } from "../db/index";
import type { Channel, Message } from "../db/types";
import Elysia, { t } from "elysia";
import { tChannel, tChannelPost, tMessage, tMessagePost } from "./schemas";
import { RecordId, StringRecordId, surql } from "surrealdb";
import { map as mapMessage } from "./messages";

export const channels = new Elysia({ prefix: "/channels", detail: { tags:["Channels"], description: "Channels manage all chat-like things in Netter." }})

.get("", async () => {
	const results = await db.query<[Channel[]]>("SELECT * FROM Channel WHERE type::is::array(target);");

	const channels = results[0];

	return channels.map(map);
}, {
	response: t.Array(tChannel),
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
	const channel = await db.select<Channel>(new StringRecordId(channel_id));

	return map(channel);
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
		author: new StringRecordId("User:yt2hrlb0mynjar8q5la5"),
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

	return messages.map(mapMessage);
}, {
	response: t.Array(tMessage),
	detail: {
		description: "Returns all messages for the channel.",
	},
});

export const map = ({ id, name, subscribers }: Channel) => ({
	id: id.toString(),
	name,
	subscribers: subscribers.map(({ user }) => user.toString()),
});