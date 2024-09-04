import type { Channel, Message } from "../db/types";
import Elysia, { t } from "elysia";
import { tChannel, tChannelId, tChannelPost, tMessage, tMessageId, tMessagePost } from "./schemas";
import Surreal, { RecordId, StringRecordId, surql } from "surrealdb";
import { map as mapMessage } from "./messages";
import { parse_mentions } from "../utils";

export const channels = (db: Surreal) => new Elysia({ prefix: "/channels", detail: { tags:["Channels"], description: "Channels manage all chat-like things in Netter." }})

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
	const [channel] = await db.create<Omit<Channel, "id">>("Channel", {
		name,
		subscribers: [],
	});

	if (!channel) {
		throw new Error("Channel not created");
	}

	return { id: channel.id.toString() };
}, {
	body: tChannelPost,
	response: t.Object({ id: tChannelId }),
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

.post("/:id/messages", async ({ params: { id }, body: { body, is_inquiry } }) => {
	// TODO: check if user is member of channel

	const channel_id = new StringRecordId(id);

	const mentions = parse_mentions(body).map(mid => new StringRecordId(mid));

	const [message] = await db.create<Omit<Message, "id">>("Message", {
		body,
		channel: channel_id as unknown as RecordId<"Channel">,
		author: new StringRecordId("User:yt2hrlb0mynjar8q5la5"),
		date: new Date(),
		resolved: is_inquiry ? false : undefined,
	});

	await Promise.all(mentions.map(id => db.query("RELATE $mid->mentions->$id;", { mid: message.id, id })));

	return { id: message.id.toString() };
}, {
	body: tMessagePost,
	response: t.Object({ id: tMessageId }),
	detail: {
		description: "Posts a message to a channel with the querying user as author.",
	},
})

.get("/:id/messages", async ({ params: { id } }) => {
	const channel_id = new StringRecordId(id);

	const results = await db.query<[Message[]]>(surql`SELECT * FROM Message WHERE channel == ${channel_id} ORDER BY date DESC;`);

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
