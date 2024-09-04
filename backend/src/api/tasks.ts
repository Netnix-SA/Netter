import type { Channel, Efforts, Feature, Priorities, ProjectId, State, Status, StatusId, Task, UserId, Value } from "../db/types";
import { map as mapChannel } from "./channels";
import { map as mapFeature } from "./features";
import { Elysia, NotFoundError, t } from "elysia";
import { tChannel, tFeature, tFeatureId, tStatusId, tTask, tTaskId, tTaskPost, tTaskUpdatePost, tUserId } from "./schemas";
import Surreal, { RecordId, StringRecordId, surql, Table } from "surrealdb";

export const tasks = (db: Surreal) => new Elysia({ prefix: "/tasks", tags: ["Tasks"] })

.get("", async ({ query: { assignee } }) => {
	return await query(db, { assignee, state: undefined, belongs_to: undefined });
}, {
	response: t.Array(tTask),
	query: t.Object({
		assignee: t.Optional(tUserId),
	}),
	detail: {
		description: "Gets the tasks for the querying user"
	}
})

.delete("/:id", async ({ params: { id }, body }) => {
	const results = await db.query<[Task[]]>(surql`SELECT * FROM Task WHERE id == ${new StringRecordId(id)};`);

	const task = results[0][0];

	if (!task) {
		throw new NotFoundError("No task under that id found!");
	}

	const task_id = new StringRecordId(id);

	switch (body.close_as) {
		case "Cancelled": case "Resolved": {
			await db.merge<Task>(task_id, { status: { id: new StringRecordId(body.id), closed_as: body.close_as, note: body.note } });
			break;
		}
		case "Duplicate": {
			await db.merge<Task>(task_id, { status: { id: new StringRecordId(body.id), closed_as: "Duplicate", original: new StringRecordId(body.original) } });
			break;
		}
	}
}, {
	config: {},
	body: t.Union([
		t.Object({
			id: tStatusId,
			close_as: t.Union([t.Literal("Resolved"), t.Literal("Cancelled")]),
			note: t.String(),
		}), 
		t.Object({
			id: tStatusId,
			close_as: t.Literal("Duplicate"),
			original: tTaskId,		
		})
	]),
	detail: {
		description: "Closes a task as resolved."
	}
})

.get("/:id", async ({ params: { id } }) => {
	const tasks = await query(db, { id, assignee: undefined, state: undefined, belongs_to: undefined });

	const task = tasks[0];

	if(task === undefined) {
		throw new NotFoundError("No task under that id found!");
	}

	return task;
}, {
	response: tTask,
	detail: {
		description: "Gets the tasks for the querying user"
	}
})

.get("/:id/channel", async ({ params: { id } }) => {
	const results = await db.query<[Channel[]]>(surql`SELECT * FROM Channel WHERE target == ${new StringRecordId(id)};`);

	const channels = results[0];

	const channel = channels[0];

	if (!channel) {
		throw new NotFoundError("No channel found for that task");
	}

	return mapChannel(channel);
}, {
	response: tChannel,
	detail: {
		description: "Gets the channel for the task"
	}
})

.get("/:id/related", async ({ params: { id } }) => {
	const results = await db.query<[(Task & { progress: number | undefined })[]]>(surql`SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM array::union(${new StringRecordId(id)}->is_related_to->Task, ${new StringRecordId(id)}<-is_related_to<-Task || []);`);

	const tasks = results[0];

	if (tasks === undefined) {
		throw new NotFoundError("No task under that id found!");
	}

	return tasks.map(map);
}, {
	response: t.Array(tTask),
	detail: {
		description: "Gets the relatives of the task"
	}
})

.post("/:id/related", async ({ params: { id }, body }) => {
	const task_id = new StringRecordId(id);

	const related_task_id = new StringRecordId(body.id);

	await db.query(surql`RELATE ${task_id}->is_related_to->${related_task_id};`);
}, {
	body: t.Object({ id: tTaskId }),
	detail: {
		description: "Adds a related task to the task."
	}
})

.get("/:id/blockers", async ({ params: { id } }) => {
	const results = await db.query<[(Task & { progress: number | undefined })[]]>(surql`SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM ${new StringRecordId(id)}<-is_blocking<-Task;`);

	const tasks = results[0];

	if (tasks === undefined) {
		throw new NotFoundError("No task under that id found!");
	}

	return tasks.map(map);
}, {
	response: t.Array(tTask),
	detail: {
		description: "Gets the relatives of the task"
	}
})

.post("/:id/blockers", async ({ params: { id }, body }) => {
	const task_id = new StringRecordId(id);

	const blocker_task_id = new StringRecordId(body.id);

	await db.query(surql`RELATE ${blocker_task_id}->is_blocking->${task_id};`);
}, {
	body: t.Object({ id: tTaskId }),
	detail: {
		description: "Adds a blocking task to the task."
	}
})

.get("/:id/children", async ({ params: { id } }) => {
	const results = await db.query<[(Task & { progress: number | undefined })[]]>(surql`SELECT *, (SELECT * FROM updates ORDER BY date DESC)[0].value as progress FROM ${new StringRecordId(id)}->is_parent_of->Task;`);

	const tasks = results[0];

	if (tasks === undefined) {
		throw new NotFoundError("No task under that id found!");
	}

	return tasks.map(map);
}, {
	response: t.Array(tTask),
	detail: {
		description: "Gets the children of the task (the tasks this task is parent to)."
	}
})

.post("/:id/children", async ({ params: { id }, body }) => {
	const parent_id = new StringRecordId(id);

	const child_id = new StringRecordId(body.id);

	await db.query(surql`RELATE ${parent_id}->is_parent_of->${child_id};`);
}, {
	body: t.Object({ id: tTaskId }),
	detail: {
		description: "Adds a child task to the task."
	}
})

.get("/:id/tackled", async ({ params: { id } }) => {
	const results = await db.query<[Feature[]]>(surql`SELECT * FROM ${new StringRecordId(id)}->tackles->Feature;`);

	const features = results[0];

	if (features === undefined) {
		throw new NotFoundError("No task under that id found!");
	}

	return features.map(mapFeature);
}, {
	response: t.Array(tFeature),
	detail: {
		description: "Gets the items tackled by the task. Tackled items can be features or bugs."
	}
})

.post("/:id/tackled", async ({ params: { id }, body }) => {
	const task_id = new StringRecordId(id);

	const tackled_object_id = new StringRecordId(body.id);

	await db.query(surql`RELATE ${task_id}->tackles->${tackled_object_id};`);
}, {
	body: t.Object({ id: tFeatureId }),
	params: t.Object({ id: tTaskId }),
	detail: {
		description: "Adds a tackled item to the task. Tackled items can be features or bugs."
	}
})

.post("", async ({ body }) => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status WHERE state = "Backlog";`);
	const statuses = results[0];

	const first_status = statuses[0];

	if (!first_status) {
		throw new Error("Did not find a status");
	}

	const task = await create(db, body.title, body.body, undefined, body.priority, body.effort, body.value, body.assignee as unknown as UserId | null, first_status.id);

	return {
		id: task.id.toString(),
	};
}, {
	body: tTaskPost,
	response: t.Object({ id: tTaskId }),
	detail: {
		description: "Creates a task.",
	}
})

.post("/:id/updates", async ({ params: { id }, body }) => {
	const results = await db.query<[Task[]]>(surql`SELECT * FROM Task WHERE id == ${new StringRecordId(id)};`);

	const task = results[0][0];

	if (!task) {
		throw new NotFoundError("No task under that id found!");
	}

	const updates = task.updates ?? [];

	updates.push({
		note: body.note,
		value: body.value,
		time_spent: body.time_spent,
		user: {
			id: new RecordId("User", "yt2hrlb0mynjar8q5la5"),
		},
		date: new Date(),
	});

	await db.merge<Task>(new StringRecordId(id), { updates });
}, {
	body: tTaskUpdatePost,
	detail: {
		description: "Adds an update to a task. Updates can only be posted by the assignee.",
	}
});

export const create = async (db: Surreal, title: string, body: string, belongs_to: ProjectId | undefined, priority: Priorities | null, effort: Efforts | null, value: Value | null, assignee: UserId | null, status: StatusId | null) => {
	const tasks = await db.create<Omit<Task, "id">>(new Table("Task"), { title, body, belongs_to, priority, effort, value, objective: null, created: new Date(), labels: [], updates: [], assignee, status: { id: status } });

	const task = tasks[0];

	if (!task) {
		throw new Error("Could not create task");
	}

	const channel = await db.create<Omit<Channel, "id">>("Channel", { target: task.id as RecordId<string>, name: title, subscribers: [] });

	return task;
};

export const query = async (db: Surreal, { id, assignee, state, belongs_to }: { id?: string, assignee?: string, state: State | undefined, belongs_to: ProjectId | undefined }) => {
	// let query = `SELECT *, (SELECT id FROM Channel where target == $parent.id)[0].id as channel, FROM Task`;
	let query = `SELECT *, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM Task`;

	let pieces = [];

	if (id) {
		pieces.push(`id == ${new StringRecordId(id)}`);
	}

	if (assignee) {
		pieces.push(`assignee == ${new StringRecordId(assignee)}`);
	}

	if (state) {
		pieces.push(`status == ${new StringRecordId(state)}`);
	}

	if (belongs_to) {
		pieces.push(`belongs_to == ${belongs_to}`);
	}

	if (pieces.length > 0) {
		query += ' WHERE ' + pieces.join(' AND ');
	}

	query += ' ORDER BY status.position.i';

	query += ';';

	const results = await db.query<[(Task & { progress: number | undefined })[]]>(query);

	const tasks = results[0];

	return tasks.map(map);
};

export const map = ({ id, title, body, priority, status, updates, labels, assignee, effort, value, progress }: Task & { progress: number | undefined }) => {
	const r_status = {
		id: status.id.toString(),
		...(status.closed_as ? (status.closed_as === "Resolved" || status.closed_as === "Cancelled" ? {
			closed_as: status.closed_as,
			note: status.note,
		} : {
			closed_as: status.closed_as,
			original: status.original.toString(),
		}) : {}),
	};

	return {
		id: id.toString(),
		title, body,
		status: r_status,
		labels: labels.map(id => ({
			id: id.toString(),
		})),
		assignee: assignee && {
			id: assignee.toString()
		},
		priority, effort, value,
		updates,
		progress: progress ?? 0,
	};
};
