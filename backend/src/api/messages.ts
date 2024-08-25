import type { Message } from "../db/types";
import { Elysia, t } from "elysia";
import { tMessage, tMessagePost, tUserId } from "./schemas";
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

.post("/:id", async ({ params: { id }, body: { body } }) => {
	await db.create<Message>("Message", {
		body,
	});
}, {
	body: tMessagePost,
	detail: {
		description: "Adds a message as a reply to another message.",
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
