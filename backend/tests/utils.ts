import { Surreal } from "surrealdb";

export async function create_db() {
	const db = new Surreal();

	await db.connect(import.meta.env.DB_URL ?? "http://db:8000/rpc", {
		auth: {
			username: "root",
			password: "root",
		},
		namespace: "testing",
		database: `${Date.now()}-${Math.floor(Math.random() * 999999)}`,
	});

	// await db.query(await Bun.file("/app/start.sql").text());

	return db;
}

export async function create_user(api: any) {
	const { data: user } = await api.api.users.post({ email: "fvilla@netnix.net", full_name: "Facundo Villa" });
	const response = await api.api.auth.token.post({ email: "fvilla@netnix.net" });
	return user;
}

export async function create_task(api: any, status: any): Promise<{ id: string }> {
	const { data: task, error } = await api.api.tasks.post({ title: "Test Task", body: "This is a test task", priority: "Low", effort: "Hour", value: "Low", assignee: null, status: status.id });
	log_error(error);
	return task;
}

export async function create_status(api: any) {
	const { data: status, error } = await api.api.statuses.post({ state: "Backlog", name: "Backlog", });
	log_error(error);
	return status;
}

// The backlog status is needed to create a project but not explicitly consumed
export async function create_project(api: any, backlog_status: any) {
	const { data: project, error } = await api.api.projects.post({ name: "Test Project", description: "This is a test project", lead: null, members: [], client: null, end: null });
	log_error(error);
	return project;
}

export async function create_product(api: any) {
	const { data: product, error } = await api.api.products.post({ name: "Test Product", description: "This is a test product", });
	log_error(error);
	return product;
}

export async function create_feature(api: any) {
	const { data: feature, error } = await api.api.features.post({ name: "Test Feature", description: "This is a test feature", constraints: "", notes: "", value: "Low" });
	log_error(error);
	return feature;
}

export async function create_objective(api: any, project: any) {
	const { data: objective, error } = await api.api.projects({ id: project.id }).objectives.post({ title: "Test Objective", description: "This is a test objective", end: null });
	log_error(error);
	return objective;
}

export async function create_component(api: any) {
	const { data: component, error } = await api.api.components.post({ name: "Test Component", description: "This is a test component", type: "Other" });
	log_error(error);
	return component;
}

export async function create_bug(client: any) {
	const { data: bug, error } = await client.api.bugs.post({ title: "Test Bug", description: "This is a test bug", });
	log_error(error);
	return bug;
}

export async function create_label(client: any) {
	const { data: label, error } = await client.api.labels.post({ title: "My Test Label", color: "Green/Light", icon: '🐛' });
	log_error(error);
	return label;
}

export function log_error(error: any) {
	if (error && error.value) {
		console.error(error.value);
	}
}