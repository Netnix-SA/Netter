import type { Channel, Message } from "../db/types";
import { Elysia, t } from "elysia";
import { tChannelId, tMessage, tMessagePost, tTaskId, tUserId } from "./schemas";
import Surreal, { StringRecordId } from "surrealdb";

export const messages = (db: Surreal) => new Elysia({ prefix: "/messages", detail: { tags: ["Messages"], description: "Messages make up the content in channels." } })

.get("", async ({ query: { author, resolved, was_mentioned } }) => {
	let query = "SELECT * FROM Message";

	let where = [];

	if (author !== undefined) {
		where.push(`author = ${author}`);
	}

	if (resolved !== undefined) {
		where.push(`resolved = ${resolved}`);
	}

	if (was_mentioned !== undefined) {
		where.push(`id->mentions->User CONTAINS ${new StringRecordId("User:yt2hrlb0mynjar8q5la5")}`);
	}

	if (where.length > 0) {
		query += ` WHERE ${where.join(" AND ")}`;
	}

	query += ";";

	const results = await db.query<[Message[]]>(query);

	const messages = results[0];

	return messages.map(map);
}, {
	query: t.Object({
		author: t.Optional(tUserId),
		resolved: t.Optional(t.Boolean()),
		was_mentioned: t.Optional(t.Boolean()),
	}),
	response: t.Array(tMessage),
})

.get("/:id/channel", async ({ params: { id } }) => {
	const message_id = new StringRecordId(id);

	const message = await db.select<Message>(message_id);

	return { id: message.channel.toString() };
}, {
	response: t.Object({ id: tChannelId })
})

.get("/:id/parent", async ({ params: { id } }) => {
	const message_id = new StringRecordId(id);

	const message = await db.select<Message>(message_id);

	const channel = await db.select<Channel>(message.channel);

	if (Array.isArray(channel.target)) {
		return { id: channel.id.toString() };
	} else {
		return { id: channel.target.toString() };
	}
}, {
	response: t.Object({ id: t.Union([tChannelId, tTaskId]) })
})

.post("/:id", async ({ params: { id }, body: { body } }) => {
	await db.create<Message>("Message", {
		body,
	});
}, {
	body: tMessagePost,
	detail: {
		description: "Adds a message as a reply to another message.",
	}
})

.patch("/:id", async ({ params: { id }, body: { resolved } }) => {
	// TODO: what if message is not an inquiry?
	await db.merge<Message>(new StringRecordId(id), { resolved });
}, {
	body: t.Object({ resolved: t.Boolean() }),
	detail: {
		description: "Resolves a message.",
	}
});

export const map = ({ id, body, author, date, resolved, question, }: Message) => ({
	id: id.toString(),
	body,
	author: {
		id: author.toString(),
	},
	date,
	resolved,
	question: question?.toString(),
});
