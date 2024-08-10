import { db } from "@/server/db";
import type { Application, Label, Project, ProjectId, Status, Task, TaskId, UserId } from "@/server/db/types";
import { Elysia, t } from "elysia";
import { tApplication, tLabel, tProject, tProjectPost, tStatus, tTask } from "./schemas";
import { RecordId, StringRecordId, surql } from "surrealdb";
import { map as mapTask, query as queryTasks } from "./tasks";
import { map as mapApplication } from "./applications";

export const projects = new Elysia({ prefix: "/projects", tags: ["Projects"] })

.post("", async ({ body }) => {
	await db.create<Omit<Project, "id">>("Project", { name: body.name, description: body.description, lead: body.lead ? new StringRecordId(body.lead) as unknown as UserId : null, members: [], milestones: [], end: null, client: null });
}, { body: tProjectPost, detail: { description: "Creates a project under the connected user's organization" } })

.get("", async () => {
	const projects = await db.select<Project>("Project");

	return projects.map(map);
}, { response: t.Array(tProject), detail: { description: "Gets the projects for the querying user" } })

.get("/:id", async ({ params: { id } }) => {
	const project = await db.select<Project>(new StringRecordId(id));

	return map(project);
}, { response: tProject, detail: { description: "Gets the project by id" } })

.get('/:id/tasks', async ({ params: { id } }) => {
	return await queryTasks({ belongs_to: new StringRecordId(id) as unknown as ProjectId, assignee: undefined, state: undefined });
}, {
	response: t.Array(tTask),
})

.get("/:id/labels", async ({ params: { id } }) => {
	const results = await db.query<[Label[]]>(surql`SELECT * FROM Label WHERE owner == ${new StringRecordId(id)};`);

	const labels = results[0];

	return labels.map(({ id, title, description, color, icon }) => ({
		id: id.toString(),
		title, description, color, icon,
	}));
}, {
	response: t.Array(tLabel),
})

.get("/:id/statuses", async ({ params: { id } }) => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status;`);

	const statuses = results[0];

	return statuses.map(({ id, name, state, color, icon }) => ({
		id: id.toString(),
		state, name, color, icon,
	}));
}, {
	response: t.Array(tStatus),
})

.get("/:id/applications", async ({ params: { id } }) => {
	const results = await db.query<[Application[]]>(surql`SELECT * FROM Application WHERE id IN (SELECT applications FROM Project WHERE id == ${new StringRecordId(id)})[0].applications;`);

	const applications = results[0];

	return applications.map(mapApplication);
}, {
	response: t.Array(tApplication),
})

export const map = ({ id, name, description, lead, client, end, milestones }: Project) => {
	return {
		id: id.toString(),
		name,
		description,
		lead: lead && {
			id: lead.toString(),
		},
		client: client?.toString(),
		members: [],
		milestones: milestones.map(m => ({ title: m.title, description: m.description, })),
		end,
	};
}