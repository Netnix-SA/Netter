import { db } from "../db/index";
import { Channel, type ApplicationId, type BugId, type ChannelId, type Efforts, type FeatureId, type Priorities, type ProjectId, type State, type Status, type StatusId, type Task, type TaskId, type Team, type UserId, type Value } from "../db/types";
import { Elysia, NotFoundError, t } from "elysia";
import { tBug, tMember, tTask, tTaskPost, tTaskUpdatePost, tTeam, tTeamPost, tUserId } from "./schemas";
import { RecordId, StringRecordId, surql, Table } from "surrealdb";

export const tasks = new Elysia({ prefix: "/tasks", tags: ["Tasks"] })

.get("", async ({ query: { assignee } }) => {
	return await query({ assignee, state: undefined, belongs_to: undefined });
}, {
	response: t.Array(tTask),
	query: t.Object({
		assignee: t.Optional(tUserId),
	}),
	detail: {
		description: "Gets the tasks for the querying user"
	}
})

.get("/:id", async ({ params: { id } }) => {
	const tasks = await query({ id, assignee: undefined, state: undefined, belongs_to: undefined });

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

.post("", async ({ body }) => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status WHERE state = "Backlog";`);
	const statuses = results[0];

	const first_status = statuses[0];

	if (!first_status) {
		throw new Error("Did not find a status");
	}

	await create(body.title, body.body, body.priority, body.effort, body.value, body.assignee as unknown as UserId | null, first_status.id);
}, {
	body: tTaskPost,
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

export const create = async (title: string, body: string, belongs_to: ProjectId, priority: Priorities | null, effort: Efforts | null, value: Value | null, assignee: UserId | null, status: StatusId | null) => {
	const tasks = await db.create<Omit<Task, "id">>(new Table("Task"), { title, body, belongs_to, priority, effort, value, objective: null, created: new Date(), labels: [], updates: [], assignee, status });

	const task = tasks[0];

	if (!task) {
		throw new Error("Could not create task");
	}

	const channel = await db.create<Omit<Channel, "id">>("Channel", { target: task.id as RecordId<string>, name: title, subscribers: [] });
};

export const query = async ({ id, assignee, state, belongs_to }: { id?: string, assignee?: string, state: State | undefined, belongs_to: ProjectId | undefined }) => {
	let query = `SELECT *, ->is_parent_of->Task as children, array::union(->is_related_to->Task, <-is_related_to<-Task) as related, <-is_blocking<-Task as blocking, ->tackles.out as tackles, (SELECT id FROM Channel where target == $parent.id)[0].id as channel, (SELECT * FROM $parent.updates ORDER BY date DESC)[0].value as progress FROM Task`;

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

	const results = await db.query<[(Task & { children: TaskId[], related: TaskId[], blocking: TaskId[], tackles: (FeatureId | ApplicationId)[], channel: ChannelId, progress: number | undefined })[]]>(query);

	const tasks = results[0];

	return tasks.map(map);
};

export const map = ({ id, title, body, priority, status, updates, labels, assignee, tackles, objective, effort, value, children, related, blocking, channel, progress }: Task & { children: TaskId[], related: TaskId[], blocking: TaskId[], tackles: (FeatureId | ApplicationId)[], channel: ChannelId, progress: number | undefined }) => {
	return {
		id: id.toString(),
		title, body,
		status: status.toString(),
		labels: labels.map(id => ({
			id: id.toString(),
		})),
		assignee: assignee && {
			id: assignee.toString()
		},
		relatives: {
			children: children.map(c => ({ id: c.toString() })),
			related: related.map(r => ({ id: r.toString() })),
			blockers: blocking.map(b => ({ id: b.toString() })),
		},
		priority, effort, value,
		channel: {
			id: channel.toString(),
		},
		updates,
		progress: progress ?? 0,
		tackles: tackles.map(id => ({
			id: id.toString(),
		})),
		objective: objective && {
			id: objective.toString(),
		},
	};
};