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

export async function create_product(api: any) {
	const { data: product } = await api.api.products.post({ name: "Test Product", description: "This is a test product", });
	return product;
}

export async function create_feature(api: any) {
	const { data: feature } = await api.api.features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });
	return feature;
}

export async function create_objective(api: any, project: any) {
	const { data: objective } = await api.api.projects({ id: project.id }).objectives.post({ title: "Test Objective", description: "This is a test objective", });
	return objective;
}

export function log_error(error: any) {
	if (error && error.value) {
		console.error(error.value);
	}
}