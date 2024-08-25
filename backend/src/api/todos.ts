import Surreal, { StringRecordId } from "surrealdb";
import type { ToDo } from "../db/types";
import { tToDoId } from "./schemas";

import { Elysia, t } from "elysia";

export const todos = (db: Surreal) => new Elysia({ prefix: "/todos", tags: ["ToDos"] })

.delete("/:id", async ({ params: { id } }) => {
	await db.delete(new StringRecordId(id));
}, {
	params: t.Object({ id: tToDoId }),
	detail: {
		description: "Deletes a ToDo item by its ID.",
	}
});

export const map = ({ id, title, owner, due, done }: ToDo) => ({
    id: id.toString(),
    title,
    owner: owner.toString(),
    due, done,
});
