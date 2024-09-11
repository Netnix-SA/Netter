import { Elysia, NotFoundError, t } from "elysia";
import type { Feature, Objective, Task } from "../db/types";
import { tFeature, tFeatureId, tFeatureId, tObjective, tTask } from "./schemas";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapTask } from "./tasks";
import { map as mapFeature } from "./features";

export const objectives = (db: Surreal) => new Elysia({ prefix: "/objectives", detail: { tags:["Objectives"], description: "Objectives are the high-level goals of a project." }})

.get("/:id", async ({ params: { id } }) => {
    const objective = await db.select<Objective>(new StringRecordId(id));

	if (!objective) {
		throw new NotFoundError("No Objective with that ID exists.");
	}

    return map(objective);
}, {
    response: tObjective,
    detail: {
        description: "Returns a single objective.",
    },
})

.get("/:id/features", async ({ params: { id } }) => {
    const results = await db.query<[Feature[]]>(surql`${new StringRecordId(id)}<-slated<-Feature.*;`);

    const features = results[0];

    return features.map(mapFeature);
}, {
    response: t.Array(tFeature),
    detail: {
        description: "Returns all features related to the objective.",
    },
})

.get("/:id/tasks", async ({ params: { id } }) => {
    const results = await db.query<[(Task & { progress: number | undefined })[]]>(surql`SELECT *, (SELECT * FROM updates ORDER BY date DESC)[0].value as progress FROM array::union(${new StringRecordId(id)}<-slated<-Feature<-tackles<-Task, ${new StringRecordId(id)}<-slated<-Feature->needs->Component<-tackles<-Task);`);

    const tasks = results[0];

    return tasks.map(mapTask);
}, {
    response: t.Array(tTask),
    detail: {
        description: "Returns all tasks related to the objective.",
    },
})

.post("/:id/slated", async ({ params: { id }, body }) => {
	const objective_id = new StringRecordId(id);

	const feature_id = new StringRecordId(body.id);

	await db.query(surql`RELATE ${feature_id}->slated->${objective_id};`);
}, {
	body: t.Object({ id: tFeatureId }),
	detail: {
		description: "Adds a slated feature to the objective.",
	}
});

;

export const map = ({ id, title, description, active }: Objective) => ({
    id: id.toString(),
    title, description,
    active,
});
