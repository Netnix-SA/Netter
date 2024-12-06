import Surreal, { StringRecordId } from "surrealdb";
import type { ToDo } from "../db/types";
import { tToDoId } from "./schemas";

import { Elysia, t } from "elysia";

export const todos = (db: Surreal) => new Elysia({ prefix: "/todos", tags: ["ToDos"] })

.patch("/:id", async ({ params: { id }, body }) => {
	const todo_id = new StringRecordId(id);

	const patch = {};

	if (body.title) patch["title"] = body.title;
	if (body.done) patch["done"] = body.done;
	if (body.due) patch["due"] = body.due;

	await db.merge(todo_id, patch);
}, {
	params: t.Object({ id: tToDoId }),
	body: t.Object({ title: t.Optional(t.String()), done: t.Optional(t.Boolean()), due: t.Optional(t.String()) }),
	detail: {
		description: "Updates a ToDo item by its ID.",
	}
})

.delete("/:id", async ({ params: { id } }) => {
	await db.delete(new StringRecordId(id));
}, {
	params: t.Object({ id: tToDoId }),
	detail: {
		description: "Deletes a ToDo item by its ID.",
	}
});

export const map = ({ id, title, due, done }: ToDo) => ({
    id: id.toString(),
    title,
    due, done,
});
