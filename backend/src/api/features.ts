import { Elysia, t } from "elysia";
import { tBug, tComponent, tComponentId, tFeature, tFeatureId, tFeaturePost, tTask, tValues } from "./schemas";
import { type Bug, type Component, type Efforts, type Feature, type Task } from "../db/types";
import { map as mapBug } from "./bugs";
import { map as mapTask } from "./tasks";
import { map as mapComponent } from "./components";
import { Surreal, StringRecordId, surql } from "surrealdb";

export const features = (db: Surreal) => new Elysia({ prefix: "/features", tags: ["Features"] })

.post("", async ({ body: { name, description, constraints, notes, value } }) => {
	const feature = await db.create<Omit<Feature, "id">>("Feature", {
		name,
		description,
		constraints,
		notes,
		value,
	});

	return { id: feature.id.toString() };
}, {
	body: tFeaturePost,
	response: t.Object({ id: tFeatureId }),
	detail: {
		description: "Creates a feature under the connected user's organization"
	}
})

.patch("/:id", async ({ params: { id }, body }) => {
	const feature_id = new StringRecordId(id);
	let feature = {};
	
	if (body.name) feature = { ...feature, name: body.name };
	if (body.description) feature = { ...feature, description: body.description };
	if (body.constraints) feature = { ...feature, constraints: body.constraints };
	if (body.notes) feature = { ...feature, notes: body.notes };
	if (body.value) feature = { ...feature, value: body.value };

	await db.merge<Feature>(feature_id, feature);
}, {
	body: t.Object({ name: t.Optional(t.String()), description: t.Optional(t.String()), constraints: t.Optional(t.String()), notes: t.Optional(t.String()), value: t.Optional(tValues) }),
	detail: {
		description: "Updates a feature"
	}
})

.delete("/:id", async ({ params: { id } }) => {
	await db.delete(new StringRecordId(id));
}, {
	params: t.Object({ id: tFeatureId }),
	detail: {
		description: "Deletes a feature"
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
	const feature_id = new StringRecordId(id);
	const [bugs] = await db.query<[Bug[]]>(surql`${feature_id}<-impacts<-Bug.*;`);

	return bugs.map(mapBug);
}, {
	response: t.Array(tBug),
	params: t.Object({ id: tFeatureId }),
})

.get("/:id/tasks", async ({ params: { id } }) => {
	const [tasks] = await db.query<[(Task & { progress: number | undefined })[]]>("SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM Task WHERE id IN (SELECT in as id FROM tackles WHERE out = $id).id;", { id: new StringRecordId(id) });

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

.post("/:id/needs", async ({ params: { id }, body }) => {
	const feature_id = new StringRecordId(id);

	await db.query(surql`RELATE ${feature_id}->needs->${new StringRecordId(body.id)};`);
}, {
	body: t.Object({ id: tComponentId }),
})

.get("/:id/statistics", async ({ params: { id } }) => {
	const [tasks] = await db.query<[(Task & { progress: number | undefined })[]]>("SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM Task WHERE id IN (SELECT in as id FROM tackles WHERE out = $id).id;", { id: new StringRecordId(id) });

	const [bugs] = await db.query<[Bug[]]>(surql`${new StringRecordId(id)}<-impacts<-Bug.*;`);

	const effort_to_time = (effort: Efforts) => {
		switch (effort) {
			case "Hour": return 1;
			case "Hours": return 6;
			case "Day": return 8;
			case "Days": return 8 * 4;
			case "Week": return 8 * 5;
		}
	};

	const total_time = tasks.reduce((acc, task) => acc + effort_to_time(task.effort), 0);
	const executed_time = tasks.reduce((acc, task) => acc + ((task.progress || 0) / 100) * effort_to_time(task.effort), 0);
	const real_time = Math.floor(tasks.reduce((acc, task) => acc + task.updates.reduce((acc, update) => acc + update.time_spent, 0), 0) / 60);

	return {
		tasks: {
			total: tasks.length,
			time: {
				total: total_time,
				executed: executed_time,
				real: real_time,
			},
			completion: tasks.length ? Math.floor((executed_time / total_time) * 100) : 0,
		},
		bugs: { total: bugs.length },
	};
}, {
	response: t.Object({
		tasks: t.Object({
			total: t.Number(),
			time: t.Object({
				total: t.Number(),
				executed: t.Number(),
				real: t.Number(),
			}),
			completion: t.Number(),
		}),
		bugs: t.Object({
			total: t.Number(),
		}),
	}),
})

;

export const map = ({ id, name, description, constraints, notes, value }: Feature) => {
	return {
		id: id.toString(),
		name,
		description, constraints, notes,
		value,
	};
};
