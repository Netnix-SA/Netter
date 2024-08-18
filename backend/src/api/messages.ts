import type { Message } from "../db/types";
import { Elysia, t } from "elysia";
import { tMessage, tMessagePost, tUserId } from "./schemas";
import { db } from "../db/index";

export const messages = new Elysia({ prefix: "/messages", detail: { tags:["Messages"], description: "Messages make up the content in channels." }})

.get("", async ({ query: { author, resolved } }) => {
	let query = "SELECT * FROM Message";

	let where = [];

	if (author !== undefined) {
		where.push(`author = ${author}`);
	}

	if (resolved !== undefined) {
		where.push(`resolved = ${resolved}`);
	}

	if (where.length > 0) {
		query += ` WHERE ${where.join(" AND ")}`;
	}

	query += ";";

	const results = await db.query<[Message[]]>(query);

	const messages = results[0];

	return messages.map(map);
},{
	query: t.Object({
		author: t.Optional(tUserId),
		resolved: t.Optional(t.Boolean()),
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
})

export const map = ({ id, body, author, date, resolved, question }: Message) => ({
	id: id.toString(),
	body,
	author: {
		id: author.toString(),
	},
	date,
	resolved,
	question: question?.toString(),
});