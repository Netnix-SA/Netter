import type { Efforts, Priorities, Value } from "./types";

function createToDo() {
	let value: { title: string, related: { id: string, title: string } | null } | null = $state(null);
  
	return {
	  get value() { return value },
	  set value(v) { value = v; },
	}
}
  
export const todo = createToDo();

function createTask() {
	type Task = {
		progress: number,
		title: string, body: string,
		status: { id: string, },
		priority: Priorities, effort: Efforts, value: Value,
		assignee: { id: string } | null,
		labels: { id: string }[],
		related: { id: string }[],
	};

	let value: Task | null = $state(null);
  
	return {
	  get value() { return value },
	  set value(v) { value = v; },
	}
}

export const task = createTask();