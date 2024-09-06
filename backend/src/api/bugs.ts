import { type Bug, type Feature } from "../db/types";
import { Elysia, t } from "elysia";
import { tBug, tBugId, tBugPost, tFeature, tFeatureId } from "./schemas";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapFeature } from "./features";

export const bugs = (db: Surreal) => new Elysia({ prefix: "/bugs", tags: ["Bugs"] })

.post("", async ({ body: { title, description, } }) => {
	const bug = await db.create<Omit<Bug, "id">>("Bug", {
		title, description,
		created: new Date(),
		resolved: false,
		release: null,
	});

	if (!bug) {
		throw new Error("Bug not created");
	}

	return { id: bug.id.toString() };
}, {
	body: tBugPost,
	response: t.Object({ id: tBugId }),
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

	const [features] = await db.query<[Feature[]]>(surql`${bug_id}->impacts->Feature.*;`);

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
})

.post("/:id/impact", async ({ params: { id }, body }) => {
	const bug_id = new StringRecordId(id);

	const feature_id = new StringRecordId(body.id);

	await db.query(surql`RELATE ${bug_id}->impacts->${feature_id};`);
}, {
	body: t.Object({ id: tFeatureId }),
	detail: {
		description: "Adds an impacted item to the bug.",
	}
})

;

export const map = ({ id, title, description, resolved, release, created, }: Bug) => ({
	id: id.toString(),
	title, description,
	resolved,
	release: release ? { id: release.toString() } : null,
	created,
});
