import type { Efforts, Priorities, Value } from "./types";

function createToDo() {
	let value: { title: string, related: { id: string, title: string } | null } | null = $state(null);

	return {
		get value() { return value },
		set value(v: { title?: string, related?: { id: string, title: string } | null } | null) {
			if (v === null) { value = null; return; }
			value = {
				title: v.title || "",
				related: v.related || null,
			};
		},
	}
}

export const todo = createToDo();

function createTask() {
	type Task = {
		title: string, body: string,
		status: { id: string, },
		priority: Priorities, effort: Efforts, value: Value,
		assignee: { id: string } | null,
		labels: { id: string }[],
		related: { id: string }[],
	};

	const DEFAULT_TASK: Task = {
		title: "", body: "",
		priority: "Low", effort: "Day", value: "Low",
		status: { id: "" },
		assignee: null,
		labels: [],
		related: [],
	};

	let value: Task | null = $state(null);
	let project: string | null = $state(null);
	let status: { id: string, } | null = $state(null);

	return {
		get value(): Task | null { return value },
		// Using this custom setter we can let users of this API set only the fields they are interested in and we fill the rest with defaults
		set value(v: { title?: string, body?: string, status?: { id: string, }, priority?: Priorities, effort?: Efforts, value?: Value, assignee?: { id: string } | null, labels?: { id: string }[], related?: { id: string }[], } | null) {
			if (v === null) { value = null; return; }
			value = {
				title: v.title || DEFAULT_TASK.title,
				body: v.body || DEFAULT_TASK.body,
				status: v.status || status || value.status,
				priority: v.priority || DEFAULT_TASK.priority,
				effort: v.effort || DEFAULT_TASK.effort,
				value: v.value || DEFAULT_TASK.value,
				assignee: v.assignee || DEFAULT_TASK.assignee,
				labels: v.labels || DEFAULT_TASK.labels,
				related: v.related || DEFAULT_TASK.related,
			};
		},
		get project() { return project },
		set project(v) { project = v; },
		get status() { return status },
		set status(v) { status = v; },
	}
}

export const task = createTask();
