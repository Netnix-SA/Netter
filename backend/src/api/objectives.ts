import { Elysia, NotFoundError, t } from "elysia";
import type { Feature, Objective, Task } from "../db/types";
import { tFeature, tFeatureId, tFeatureId, tObjective, tObjectiveId, tTask } from "./schemas";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapTask } from "./tasks";
import { map as mapFeature } from "./features";
import { effort_to_time } from "../utils";

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
})

.delete("/:id/slated/:sid", async ({ params: { id, sid }, body }) => {
	const objective_id = new StringRecordId(id);

	const slated_id = new StringRecordId(sid);

	await db.query(surql`DELETE FROM slated WHERE in = ${slated_id} AND out = ${objective_id};`);
}, {
	params: t.Object({ id: tObjectiveId, sid: tFeatureId }),
	detail: {
		description: "Removes a slated feature from the objective.",
	},
})

.get("/:id/statistics", async ({ params: { id } }) => {
	const objective_id = new StringRecordId(id);

	const resolved_status_id = new StringRecordId("Status:4u4jpjj6np6z82qozui2");

	const [features, tasks] = await db.query<[(Feature & { done: boolean })[], (Task & { progress: number | undefined })[]]>(surql`SELECT *, (array::every($parent<-tackles<-Task.status.id, |$v| $v == ${resolved_status_id})) AS done FROM ${objective_id}<-slated<-Feature; SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM ${objective_id}<-slated<-Feature<-tackles<-Task;`);

	const total_time = tasks.reduce((acc, task) => acc + effort_to_time(task.effort), 0);
	const executed_time = tasks.reduce((acc, task) => acc + ((task.progress || 0) / 100) * effort_to_time(task.effort), 0);
	const real_time = Math.floor(tasks.reduce((acc, task) => acc + task.updates.reduce((acc, update) => acc + update.time_spent, 0), 0) / 60);

	const completed_features = features.filter(feature => feature.done);

	return {
		features: {
			completed: completed_features.length,
			total: features.length,
			completion: features.length ? Math.floor((completed_features.length / features.length) * 100) : 0,
		},
		tasks: {
			total: tasks.length,
			time: {
				total: total_time,
				executed: executed_time,
				real: real_time,
			},
			completion: tasks.length ? Math.floor((executed_time / total_time) * 100) : 0,
		},
	};
}, {
	response: t.Object({
		features: t.Object({
			completed: t.Number(),
			total: t.Number(),
			completion: t.Number({ minimum: 0, maximum: 100 }),
		}),
		tasks: t.Object({
			total: t.Number(),
			time: t.Object({
				total: t.Number(),
				executed: t.Number(),
				real: t.Number(),
			}),
			completion: t.Number({ minimum: 0, maximum: 100 }),
		}),
	}),
	detail: {
		description: "Returns execution statistics for the objective. Like /features/:id/statistics, but for an objective.",
	},
});

;

export const map = ({ id, title, description, active, end }: Objective) => ({
    id: id.toString(),
    title, description,
    active,
	end,
});
