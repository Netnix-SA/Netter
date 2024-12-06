import { Elysia, t } from "elysia";
import type { Component } from "../db/types";
import { tComponent, tComponentId, tComponentPost } from "./schemas";
import Surreal, { StringRecordId, surql } from "surrealdb";

export const components = (db: Surreal) => new Elysia({ prefix: "/components", tags: ["Components"] })

.post("", async ({ body }) => {
	const component = await db.create<Omit<Component, "id">>("Component", { name: body.name, description: body.description, type: body.type });

	return { id: component.id.toString() };
}, {
	body: tComponentPost,
	response: t.Object({ id: tComponentId }),
})

.patch("/:id", async ({ params: { id }, body }) => {
	const component_id = new StringRecordId(id);

	let patch = {};

	if (body.name) patch["name"] = body.name;
	if (body.description) patch["description"] = body.description;
	if (body.type) patch["type"] = body.type;

	await db.merge(component_id, patch);
}, {
	body: t.Object({
		name: t.Optional(t.String()),
		description: t.Optional(t.String()),
		type: t.Optional(t.String()),
	}),
})

.get("/:id", async ({ params: { id } }) => {
	const results = await db.query<[Component[]]>("SELECT * FROM Component WHERE id == $id;", { id: new StringRecordId(id) });

	const components = results[0];

	const component = components[0];

	return map(component);
}, {
	response: tComponent,
});

export const map = ({ id, type, name, description }: Component) => ({
	id: id.toString(),
	name, description, type,
});
