import { Elysia, t } from "elysia";
import { tFeature, tFeaturePost } from "./schemas";
import { db } from "@/server/db";
import { type Feature } from "@/server/db/types";
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

export const map = ({ id, name, description }: Feature) => {
	return {
		id: id.toString(),
		name, description,
	};
};