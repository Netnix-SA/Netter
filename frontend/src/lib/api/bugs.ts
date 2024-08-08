import { db } from "@/server/db";
import { type Bug, type Feature } from "@/server/db/types";
import { Elysia, t } from "elysia";
import { tBug, tBugPost, tFeature } from "./schemas";
import { StringRecordId, surql } from "surrealdb";

export const bugs = new Elysia({ prefix: "/bugs", tags: ["Bugs"] });

bugs.post("", async ({ body: { title, description, } }) => {
	await db.create<Omit<Bug, "id">>("Bug", {
		title, description,
		features: [],
	});
}, {
	body: tBugPost,
	detail: {
		description: "Creates a bug under the connected user's organization"
	}
});

bugs.get("", async () => {
	const bugs = await db.select<Bug>("Bug");

	return bugs.map(({ id, title, description }) => ({
		id: id.toString(),
		title, description,
	}));
}, {
	response: t.Array(tBug),
});

bugs.get("/:id/impact", async ({ params: { id } }) => {
	const bug_id = new StringRecordId(id);

	const results = await db.query<[Feature[]]>(surql`SELECT * FROM Feature WHERE id IN (SELECT features FROM Bug WHERE id = ${bug_id})[0].features;`);

	const features = results[0];

	return {
		features: features.map(({ id, name, description }) => ({
			id: id?.toString(),
			name, description,
		})),
	};
}, {
	response: t.Object({
		features: t.Array(tFeature),
	}),
	detail: {
		description: "Returns the items impacted/affected by this bug.",
	}
});