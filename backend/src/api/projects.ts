import type { Application, Label, Objective, Project, ProjectId, Status, StatusId, Task, TaskId, UserId } from "../db/types";
import { Elysia, NotFoundError, t } from "elysia";
import { tApplication, tLabel, tObjective, tObjectiveId, tObjectivePost, tProject, tProjectId, tProjectPost, tProjectUpdatePost, tStatus, tStatusId, tStatusPost, tTask, tTaskId, tTaskPost, tUserId } from "./schemas";
import Surreal, { RecordId, StringRecordId, surql } from "surrealdb";
import { map as mapTask, query as queryTasks, create as createTask, } from "./tasks";
import { map as mapLabel } from "./labels";
import { map as mapObjective } from "./objectives";

export const projects = (db: Surreal) => new Elysia({ prefix: "/projects", tags: ["Projects"] })

.post("", async ({ body }) => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status WHERE state = "Backlog";`);
	const statuses = results[0];

	const first_status = statuses[0];

	if (!first_status) {
		throw new Error("Did not find a status");
	}

	const project = await db.create<Omit<Project, "id">>("Project", {
		name: body.name, description: body.description,

		created: new Date(),

		lead: body.lead ? new StringRecordId(body.lead) as unknown as UserId : null,
		members: [], milestones: [],
		end: null,
		client: null,
		status: first_status.id,
		objectives: [],
		updates: [],
	});

	return { id: project.id.toString() };
}, {
	body: tProjectPost,
	response: t.Object({ id: tProjectId }),
	detail: {
		description: "Creates a project under the connected user's organization. Needs a backlog status to exist to be created."
	}
})

.patch("/:id", async ({ body, params: { id } }) => {
	const project_id = new StringRecordId(id);

	let project = {};

	if (body.name) { project = { ...project, name: body.name }; }
	if (body.description) { project = { ...project, description: body.description }; }
	if (body.lead) { project = { ...project, lead: new StringRecordId(body.lead) as unknown as UserId }; }
	if (body.end) { project = { ...project, end: body.end }; }
	if (body.status) { project = { ...project, status: new StringRecordId(body.status.id) as unknown as StatusId }; }

	await db.merge(project_id, project);
}, {
	body: t.Object({
		name: t.Optional(t.String()),
		description: t.Optional(t.String()),
		lead: t.Optional(tUserId),
		end: t.Optional(t.Date()),
		status: t.Optional(t.Object({ id: tStatusId })),
	}),
})

.post("/:id/members", async ({ body, params: { id } }) => {
	const project_id = new StringRecordId(id);

	const project = await db.select<Project>(project_id);

	if (!project) {
		throw new NotFoundError("No project under that id found!");
	}

	await db.merge(project_id, { members: [...project.members, { id: new StringRecordId(body.id) as unknown as UserId }] });
}, {
	body: t.Object({ id: tUserId }),
})

.get("", async () => {
	const projects = await query(db, {});

	return projects;
}, { response: t.Array(tProject), detail: { description: "Gets the projects for the querying user" } })

.get("/:id", async ({ params: { id } }) => {
	const projects = await query(db, { id });

	const project = projects[0];

	if (!project) {
		throw new NotFoundError("No project under that id found!");
	}

	return project;
}, {
	response: tProject,
	detail: {
		description: "Gets the project by id"
	}
})

.get('/:id/tasks', async ({ params: { id } }) => {
	return await queryTasks(db, { belongs_to: new StringRecordId(id) as unknown as ProjectId, assignee: undefined, state: undefined });
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

	const task = await createTask(db, body.title, body.body, new StringRecordId(id) as unknown as ProjectId, body.priority, body.effort, body.value, body.assignee as unknown as UserId | null, body.status as unknown as StatusId || first_status.id);

	return { id: task.id.toString() };
}, {
	body: tTaskPost,
	response: t.Object({ id: tTaskId }),
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

.post("/:id/statuses", async ({ body, params: { id } }) => {
	const project_id = new StringRecordId(id);

	const status = await db.create<Omit<Status, "id">>("Status", { name: body.name, state: body.state, color: "Green/Light", icon: ':' });

	return { id: status.id.toString() };
}, {
	body: tStatusPost,
	response: t.Object({ id: tStatusId }),
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

// TODO: get components
// .get("/:id/applications", async ({ params: { id } }) => {
// 	const results = await db.query<[Application[]]>(surql`SELECT * FROM Application WHERE id IN (SELECT applications FROM Project WHERE id == ${new StringRecordId(id)})[0].applications;`);

// 	const applications = results[0];

// 	return applications.map(mapApplication);
// }, {
// 	response: t.Array(tApplication),
// })

.get("/:id/objectives", async ({ params: { id } }) => {
	const [objectives] = await db.query<[Objective[]]>(surql`${new StringRecordId(id)}.objectives.id.*;`);

	return objectives.map(mapObjective);
}, {
	response: t.Array(tObjective),
})

.post("/:id/objectives", async ({ params: { id }, body }) => {
	const objective = await db.create<Omit<Objective, "id">>("Objective", { title: body.title, description: body.description, active: true, end: body.end });

	const project_id = new StringRecordId(id);
	const project = await db.select<Project>(project_id);

	await db.merge(project_id, { objectives: [...project.objectives, { id: objective.id }] });

	return { id: objective.id.toString() };
}, {
	body: tObjectivePost,
	response: t.Object({ id: tObjectiveId }),
})

.post("/:id/milestones", async ({ params: { id }, body }) => {
	const project_id = new StringRecordId(id);
	const project = await db.select<Project>(project_id);

	await db.merge(project_id, { milestones: [...project.milestones, { title: body.title, description: body.description }] });
}, {
	body: t.Object({ title: t.String(), description: t.String() }),
})

.get("/:id/milestones", async ({ params: { id } }) => {
	const project_id = new StringRecordId(id);
	const project = await db.select<Project>(project_id);

	return project.milestones;
}, {
	response: t.Array(t.Object({ title: t.String(), description: t.String() })),
})

.post("/:id/updates", async ({ params: { id }, body }) => {
	const project_id = new StringRecordId(id);
	const project = await db.select<Project>(project_id);

	await db.merge(project_id, { updates: [...project.updates, { title: body.title, body: body.body }] });
}, {
	body: tProjectUpdatePost,
})

.delete("/:id", async ({ params: { id } }) => {
	const project_id = new StringRecordId(id);

	await db.query(surql`
		BEGIN TRANSACTION;

		DELETE FROM Task WHERE belongs_to == ${project_id};
		DELETE FROM Objective WHERE id IN ${project_id}.objectives.id;
		DELETE FROM Project WHERE id == ${project_id};

		COMMIT TRANSACTION;
	`);
}, {
	params: t.Object({ id: tProjectId }),
	detail: {
		description: "Deletes a project by its ID. This will also delete all tasks and objectives associated with the project.",
	}
})

;

export const query = async (db: Surreal, { id }: { id?: ProjectId }) => {
	let query = `SELECT * FROM Project`;

	let pieces = [];

	if (id) {
		pieces.push(`id == ${new StringRecordId(id)}`);
	}

	if (pieces.length > 0) {
		query += ` WHERE ${pieces.join(" AND ")}`;
	}

	query += " ORDER BY created DESC;";

	const results = await db.query<[(Project & { objectives: Objective[] })[]]>(query);

	const projects = results[0];

	return projects.map(map);
};

export const map = ({ id, name, description, status, members, lead, client, end, milestones, updates, objectives }: Project) => {
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
		members: members.map(member => ({ id: member.id.toString() })),
		milestones: milestones.map(m => ({ title: m.title, description: m.description, })),
		end,
		updates,
		objectives: objectives.map(objective => ({ id: objective.id.toString() })),
	};
};
