import { Elysia, t } from "elysia";
import { tBug, tComponent, tFeature, tFeaturePost, tTask } from "./schemas";
import { db } from "../db/index";
import { type Bug, type Component, type Feature, type Task } from "../db/types";
import { map as mapBug } from "./bugs";
import { map as mapTask } from "./tasks";
import { map as mapComponent } from "./components";
import { StringRecordId } from "surrealdb";

export const features = new Elysia({ prefix: "/features", tags: ["Features"] })

.post("", async ({ body: { name, description } }) => {
	await db.create<Omit<Feature, "id">>("Feature", {
		name,
		description,
	});
}, {
	body: tFeaturePost,
	detail: {
		description: "Creates a feature under the connected user's organization"
	}
})

.get("", async () => {
	const features = await db.select<Feature>("Feature");

	return features.map(map);
}, {
	response: t.Array(tFeature),
})

.get("/:id", async ({ params: { id } }) => {
	const feature = await db.select<Feature>(new StringRecordId(id));

	return map(feature);
}, {
	response: tFeature,
})

.get("/:id/bugs", async ({ params: { id } }) => {
	const results = await db.query<[Bug[]]>("SELECT * FROM Bug WHERE $id IN features;", { id: new StringRecordId(id) });

	const bugs = results[0];

	return bugs.map(mapBug);
}, {
	response: t.Array(tBug),
})

.get("/:id/tasks", async ({ params: { id } }) => {
	const results = await db.query<[(Task & { progress: number | undefined })[]]>("SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM Task WHERE id IN (SELECT in as id FROM tackles WHERE out = $id).id;", { id: new StringRecordId(id) });

	const tasks = results[0];

	return tasks.map(mapTask);
}, {
	response: t.Array(tTask),
})

.get("/:id/components", async ({ params: { id } }) => {
	const results = await db.query<[Component[]]>("$id->needs->Component.*;", { id: new StringRecordId(id) });

	const components = results[0];

	return components.map(mapComponent);
}, {
	response: t.Array(tComponent),
})

export const map = ({ id, name, description, value }: Feature) => {
	return {
		id: id.toString(),
		name, description,
		value,
	};
};
