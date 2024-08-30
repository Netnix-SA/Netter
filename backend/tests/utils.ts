import type { Treaty, treaty } from "@elysiajs/eden";
import { Surreal } from "surrealdb";
import { server, type App } from "../src/api";

export async function create_db() {
	const db = new Surreal();

	await db.connect("http://db:8000/rpc", {
		auth: {
			username: "root",
			password: "root",
		},
		namespace: "testing",
		database: `${Date.now()}`,
	});

	return db;
}

export async function create_task(api: any, status: any) {
	const { data: task } = await api.api.tasks.post({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", assignee: null, status: status.id });
	return task;
}

export async function create_user(api: any) {
	const { data: user } = await api.api.users.post({ email: "fvilla@netnix.net", full_name: "Facundo Villa" });
	const response = await api.api.auth.token.post({ email: "fvilla@netnix.net" });
	return user;
}

export async function create_status(api: any) {
	const { data: status, error } = await api.api.statuses.post({ state: "Backlog", name: "Backlog", });
	return status;
}

// The backlog status is needed to create a project but not explicitly consumed
export async function create_project(api: any, backlog_status: any) {
	const { data: project, error } = await api.api.projects.post({ name: "Test Project", description: "This is a test project", lead: null, members: [], client: null, end: null });
	return project;
}
