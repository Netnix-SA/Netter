import Elysia from "elysia";
import type { Component } from "../db/types";
import { tComponent } from "./schemas";
import Surreal, { StringRecordId, surql } from "surrealdb";

export const components = (db: Surreal) => new Elysia({ prefix: "/components", tags: ["Components"] })

.get("/:id", async ({ params: { id } }) => {
	const results = await db.query<[Component[]]>("SELECT * FROM Component WHERE id == $id;", { id: new StringRecordId(id) });

	console.log(id);

	const components = results[0];

	const component = components[0];

	return map(component);
}, {
	response: tComponent,
});

export const map = ({ id, name, description }: Component) => ({
	id: id.toString(),
	name, description,
});
