import { type Bug, type Feature } from "../db/types";
import { Elysia, t } from "elysia";
import { tBug, tBugPost, tFeature } from "./schemas";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapFeature } from "./features";

export const bugs = (db: Surreal) => new Elysia({ prefix: "/bugs", tags: ["Bugs"] })

.post("", async ({ body: { title, description, } }) => {
	await db.create<Omit<Bug, "id">>("Bug", {
		title, description,
		features: [],
		applications: [],
		created: new Date(),
		resolved: false,
		release: null,
	});
}, {
	body: tBugPost,
	detail: {
		description: "Creates a bug under the connected user's organization"
	}
})

.get("", async () => {
	const bugs = await db.select<Bug>("Bug");

	return bugs.map(map);
}, {
	response: t.Array(tBug),
})

.get("/:id", async ({ params: { id } }) => {
	const bug = await db.select<Bug>(new StringRecordId(id));

	return map(bug);
}, {
	response: tBug,
	detail: {
		description: "Returns the bug with the given id."
	}
})

.get("/:id/impact", async ({ params: { id } }) => {
	const bug_id = new StringRecordId(id);

	const results = await db.query<[Feature[]]>(surql`SELECT * FROM Feature WHERE id IN (SELECT features FROM Bug WHERE id = ${bug_id})[0].features;`);

	const features = results[0];

	return {
		features: features.map(mapFeature),
	};
}, {
	response: t.Object({
		features: t.Array(tFeature),
	}),
	detail: {
		description: "Returns the items impacted/affected by this bug.",
	}
});

export const map = ({ id, title, description, resolved, release, applications, created, features }: Bug) => ({
	id: id.toString(),
	title, description,
	resolved,
	release: release ? { id: release.toString() } : null,
	created,
	impact: {
		applications: applications.map((id) => ({ id: id.toString() })),
		features: features.map((id) => ({ id: id.toString() })),
	},
});
