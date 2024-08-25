import type { Application, Label, Objective, Project, ProjectId, Status, StatusId, Task, TaskId, UserId } from "../db/types";
import { Elysia, t } from "elysia";
import { tApplication, tLabel, tObjective, tProject, tProjectPost, tStatus, tTask, tTaskPost } from "./schemas";
import Surreal, { RecordId, StringRecordId, surql } from "surrealdb";
import { map as mapTask, query as queryTasks, create as createTask, } from "./tasks";
import { map as mapApplication } from "./applications";
import { map as mapLabel } from "./labels";
import { map as mapObjective } from "./objectives";

export const projects = (db: Surreal) => new Elysia({ prefix: "/projects", tags: ["Projects"] })

.post("", async ({ body }) => {
	await db.create<Omit<Project, "id">>("Project", { name: body.name, description: body.description, lead: body.lead ? new StringRecordId(body.lead) as unknown as UserId : null, members: [], milestones: [], end: null, client: null });
}, { body: tProjectPost, detail: { description: "Creates a project under the connected user's organization" } })

.get("", async () => {
	const projects = await query(db, {});

	return projects;
}, { response: t.Array(tProject), detail: { description: "Gets the projects for the querying user" } })

.get("/:id", async ({ params: { id } }) => {
	const projects = await query(db, { id });

	const project = projects[0];

	if (!project) {
		throw new Error("No project under that id found!");
	}

	return project;
}, {
	response: tProject,
	detail: {
		description: "Gets the project by id"
	}
})

.get('/:id/tasks', async ({ params: { id } }) => {
	return await queryTasks({ belongs_to: new StringRecordId(id) as unknown as ProjectId, assignee: undefined, state: undefined });
}, {
	response: t.Array(tTask),
})

.post("/:id/tasks", async ({ params: { id }, body }) => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status WHERE state = "Backlog";`);
	const statuses = results[0];

	const first_status = statuses[0];

	if (!first_status) {
		throw new Error("Did not find a status");
	}

	await createTask(body.title, body.body, new StringRecordId(id) as unknown as ProjectId, body.priority, body.effort, body.value, body.assignee as unknown as UserId | null, body.status as unknown as StatusId || first_status.id);
}, {
	body: tTaskPost,
})

.get("/:id/labels", async ({ params: { id } }) => {
	const results = await db.query<[Label[]]>(surql`SELECT * FROM Label WHERE owner == ${new StringRecordId(id)} || !owner;`);

	const labels = results[0];

	return labels.map(mapLabel);
}, {
	response: t.Array(tLabel),
	detail: {
		description: "Gets the labels for the project. Includes organization labels and project specific labels.",
	}
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

.get("/:id/objectives", async ({ params: { id } }) => {
	const results = await db.query<[Objective[]]>(surql`${new StringRecordId(id)}.objectives.id.*;`);

	const objectives = results[0];

	return objectives.map(mapObjective);
}, {
	response: t.Array(tObjective),
});

export const query = async (db: Surreal, { id }: { id?: ProjectId }) => {
	let query = `SELECT * FROM Project`;

	let pieces = [];

	if (id) {
		pieces.push(`id == ${new StringRecordId(id)}`);
	}

	if (pieces.length > 0) {
		query += ` WHERE ${pieces.join(" AND ")}`;
	}

	query += ";";

	const results = await db.query<[(Project & { objectives: Objective[] })[]]>(query);

	const projects = results[0];

	return projects.map(map);
};

export const map = ({ id, name, description, status, lead, client, end, milestones, updates }: Project) => {
	return {
		id: id.toString(),
		name,
		description,
		lead: lead && {
			id: lead.toString(),
		},
		status: {
			id: status.toString(),
		},
		client: client?.toString(),
		members: [],
		milestones: milestones.map(m => ({ title: m.title, description: m.description, })),
		end,
		updates,
	};
};
