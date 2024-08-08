import { db } from "@/server/db";
import type { Status, StatusId, Task, TaskId, Team } from "@/server/db/types";
import { Elysia, NotFoundError, t } from "elysia";
import { tBug, tMember, tTask, tTaskPost, tTeam, tTeamPost } from "./schemas";
import { RecordId, StringRecordId, surql } from "surrealdb";

export const tasks = new Elysia({ prefix: "/tasks", tags: ["Tasks"] })

.get("", async () => {
	const results = await db.query<[(Task & { children: TaskId[], related: TaskId[], blocking: TaskId[] })[]]>(surql`SELECT *, ->is_parent_of->Task as children, ->is_related_to->Task as related, <-is_blocking<-Task as blocking FROM Task;`);
	
	const tasks = results[0];
	
	return tasks.map(map);
}, { response: t.Array(tTask), detail: { description: "Gets the tasks for the querying user" } })

.get("/:id", async ({ params: { id } }) => {
	const results = await db.query<[(Task & { children: TaskId[], related: TaskId[], blocking: TaskId[] })[]]>(surql`SELECT *, ->is_parent_of->Task as children, ->is_related_to->Task as related, <-is_blocking<-Task as blocking FROM Task WHERE id == ${new StringRecordId(id)};`);

	const tasks = results[0];
	const task = tasks[0];

	if(!task) {
		throw new NotFoundError("No task under that id found!");
	}

	return map(task);
}, { response: tTask, detail: { description: "Gets the tasks for the querying user" } })

.post("", async ({ body }) => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status;`);
	const statuses = results[0];

	const first_status = statuses[0];

	if (!first_status) {
		throw new Error("Did not find a status");
	}

	await db.create<Omit<Task, "id">>("Task", { title: body.title, body: "", priority: "Medium", effort: 'Days', created: new Date(), labels: [], assignee: null, status: body.status ? new StringRecordId(body.status) as unknown as StatusId : first_status.id });
}, {
	body: tTaskPost,
	detail: {
		description: "Creates a task.",
	}
});

export const map = ({ id, title, body, priority, status, labels, assignee, effort, children, related, blocking }: Task & { children: TaskId[], related: TaskId[], blocking: TaskId[] }) => {
	return {
		id: id.toString(),
		title, body,
		status: status.toString(),
		priority,
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
		effort,
	};
};

export const mapMulti = ({ id, title, body, priority, status, labels, assignee, effort }: Task) => {
	return {
		id: id.toString(),
		title, body,
		status: status.toString(),
		priority,
		labels: labels.map(id => ({
			id: id.toString(),
		})),
		effort,
		assignee: assignee && {
			id: assignee.toString()
		},
	};
};