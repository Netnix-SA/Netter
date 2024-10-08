import { treaty } from "@elysiajs/eden";
import { writable } from "svelte/store";
import type { App } from "../../../backend/src/api";
import { task, todo } from "./global.svelte.ts";
import { toast } from "svelte-sonner";
import { goto, invalidate } from "$app/navigation";
import { createMutation } from "./query";
import type { Efforts, Value } from "./types";

export const client = treaty<App>('localhost', { fetch: { credentials: 'include' } });

export const commands = writable<{ name: string, commands: { name: string, key?: string, do: () => void }[] }[]>([]);

export const onError = (message: string) => () => {
	toast.error(message);
};

export const createTaskMutation = createMutation({
	mutationFn: async () => {
		const t = task.value;
		if (t === null) { throw new Error("Task is null"); }
		if (task.project === undefined) {
			const response = await client.api.tasks.post({
				title: t.title,
				body: t.body,
				status: t.status?.id || null,
				priority: t.priority,
				effort: t.effort,
				value: t.value,
				assignee: t.assignee?.id || null,
			});
			if (response.error) {
				throw new Error();
			} else {
				return response.data;
			}
		} else {
			const response = await client.api.projects({ id: task.project }).tasks.post({
				title: t.title,
				body: t.body,
				status: t.status?.id || null,
				priority: t.priority,
				effort: t.effort,
				value: t.value,
				assignee: t.assignee?.id || null,
			});
			if (response.error) {
				throw new Error();
			} else {
				return response.data;
			}
		}
	},
	onSuccess: (response) => {
		task.value = null;
		toast.success("Created Task", {
			action: {
				label: "Open",
				onClick: () => {
					goto(`/tasks/${response.id}`);
				},
			}
		});
		invalidate('tasks:get');
	},
	onError: onError("Failed to create task"),
});

export const pinItemMutation = createMutation({
	mutationFn: async (id: string) => {
		const response = await client.api.users.me.pins.post({ id });
		if (response.error) {
			throw new Error();
		}
	},
	onSuccess: () => {
		toast.success("Pinned item");
		invalidate('pins:get');
	},
	onError: onError("Failed to pin item"),
});

export const deleteTaskMutation = createMutation({
	mutationFn: async (id: string) => {
		const response = await client.api.tasks({ id }).delete();
		if (response.error) {
			throw new Error();
		}

		return { id };
	},
	onSuccess: (data) => {
		toast.success("Deleted Task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to delete task"),
});

export const deleteToDoMutation = createMutation({
	mutationFn: async ({ id }: { id: string }) => {
		await client.api.todos({ id }).delete();
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Deleted ToDo");
		invalidate('todos:get');
		invalidate(data.id);
	},
	onError: onError("Failed to delete ToDo"),
});

export const updateFeatureMutation = createMutation({
	mutationFn: async ({ id, name, description, constraints, notes, value }: { id: string, name: string, description: string, constraints: string, notes: string, value: Value }) => {
		const response = await client.api.features({ id }).patch({ name, description, constraints, notes, value });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Updated Feature");
		invalidate('features:get');
		invalidate(data.id);
	},
	onError: onError("Failed to update feature"),
});

export const deleteProjectMutation = createMutation({
	mutationFn: async (id: string) => {
		const response = await client.api.projects({ id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Deleted Project");
		invalidate('projects:get');
		invalidate(data.id);
	},
	onError: onError("Failed to delete project"),
});

export const createProductMutation = createMutation({
	mutationFn: async () => {
		const response = await client.api.products.post({ name: "New Product", description: "Product description", });
		if (response.data) {
			return response.data;
		} else {
			throw new Error("Failed to create product");
		}
	},
	onSuccess: (response) => {
		toast.success("Created product", {
			action: {
				label: "Open",
				onClick: () => goto(`/products/${response.id}`),
			},
		});
		invalidate('products:get');
	},
	onError: onError("Failed to create product"),
});

export const createProductFeatureMutation = createMutation({
	mutationFn: async ({ id }: { id: string }) => {
		const response = await client.api.products({ id }).features.post({ name: "New Feature", description: "Feature description", constraints: "", notes: "", value: "Low" });
		if (response.data) {
			return response.data;
		} else {
			throw new Error();
		}
	},
	onSuccess: (response) => {
		toast.success("Added feature to product", {
			action: {
				label: "Open",
				onClick: () => goto(`/features/${response.id}`),
			},
		});
		invalidate('features:get');
	},
	onError: onError("Failed to add feature to product"),
});

export const updateTaskMutation = createMutation({
	mutationFn: async ({ id, title, body, priority, effort, value, }: { id: string, title: string, body: string, priority?: "Low" | "Medium" | "High", effort: Efforts, value: Value }) => {
		const response = await client.api.tasks({ id }).patch({ title, body, priority, effort, value, });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Updated Task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to update task"),
});

export const deleteFeatureMutation = createMutation({
	mutationFn: async (id: string) => {
		const response = await client.api.features({ id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Deleted Feature");
		invalidate('features:get');
		invalidate(data.id);
	},
	onError: onError("Failed to delete feature"),
});

export const createObjectiveMutation = createMutation({
	mutationFn: async ({ project_id }: { project_id: string }) => {
		console.log("Creating objective");
		const response = await client.api.projects({ id: project_id }).objectives.post({ title: "New objective", description: "Objective description" });
		if (response.data) {
			return response.data;
		} else {
			console.error(response.error);
			throw new Error("Failed to create objective");
		}
	},
	onSuccess: (response) => {
		toast.success("Created new objective!", {
			action: {
				label: "Open",
				onClick: () => {
					goto(`/objectives/${response.id}`);
				},
			}
		});
		invalidate('project:get');
	},
	onError: onError("Failed to create objective"),
});

export const deleteProductMutation = createMutation({
	mutationFn: async (id: string) => {
		const response = await client.api.products({ id }).delete();
		if (response.error) {
			throw new Error();
		}
	},
	onSuccess: () => {
		toast.success("Deleted Product");
		invalidate('products:get');
	},
	onError: onError("Failed to delete product"),
});

export const createProjectMutation = createMutation({
	mutationFn: async () => {
		const response = await client.api.projects.post({ name: "New Project", description: "Project description", lead: null, members: [], client: null, end: null });
		if (response.data) {
			return response.data;
		} else {
			throw new Error("Failed to create project");
		}
	},
	onSuccess: (response) => {
		toast.success("Created project", {
			action: {
				label: "Open",
				onClick: () => goto(`/projects/${response.id}`),
			},
		});
		invalidate('projects:get');
	},
	onError: onError("Failed to create project"),
});

export const createToDoMutation = createMutation({
	mutationFn: async ({ title }: { title: string }) => {
		return client.api.users.me.todos.post({ title });
	},
	onSuccess: () => {
		toast.success("Created ToDo");
		todo.value = null;
	},
	onError: onError("Failed to create ToDo"),
});

export const updateProductMutation = createMutation({
	mutationFn: async ({ id, name, description, }: { id: string, name: string, description: string, }) => {
		const response = await client.api.products({ id }).patch({ name, description, });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Updated Product");
		invalidate('products:get');
		invalidate(data.id);
	},
	onError: onError("Failed to update product"),
});

export const addTaskBlockerMutation = createMutation({
	mutationFn: async ({ id, blocker_id }: { id: string, blocker_id: string }) => {
		const response = await client.api.tasks({ id }).blockers.post({ id: blocker_id });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Added blocker to task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to add blocker to task"),
});

export const addTaskRelativeMutation = createMutation({
	mutationFn: async ({ id, relative_id }: { id: string, relative_id: string }) => {
		const response = await client.api.tasks({ id }).related.post({ id: relative_id });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Added relative to task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to add relative to task"),
});

export const addTaskChildMutation = createMutation({
	mutationFn: async ({ id, child_id }: { id: string, child_id: string }) => {
		const response = await client.api.tasks({ id }).children.post({ id: child_id });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Added child to task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to add child to task"),
});

export const addTaskTackledMutation = createMutation({
	mutationFn: async ({ id, tackled_id }: { id: string, tackled_id: string }) => {
		const response = await client.api.tasks({ id }).tackled.post({ id: tackled_id });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Added tackled to task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to add tackled to task"),
});

export const removeChildTaskMutation = createMutation({
	mutationFn: async ({ id, child_id }: { id: string, child_id: string }) => {
		const response = await client.api.tasks({ id }).children({ cid: child_id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Removed child from task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to remove child from task"),
});

export const removeBlockerTaskMutation = createMutation({
	mutationFn: async ({ id, blocker_id }: { id: string, blocker_id: string }) => {
		const response = await client.api.tasks({ id }).blockers({ bid: blocker_id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Removed blocker from task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to remove blocker from task"),
});

export const removeRelativeTaskMutation = createMutation({
	mutationFn: async ({ id, relative_id }: { id: string, relative_id: string }) => {
		const response = await client.api.tasks({ id }).related({ rid: relative_id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Removed relative from task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to remove relative from task"),
});

export const removeTackledMutation = createMutation({
	mutationFn: async ({ id, tackled_id }: { id: string, tackled_id: string }) => {
		const response = await client.api.tasks({ id }).tackled({ tid: tackled_id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Removed tackled from task");
		invalidate('tasks:get');
		invalidate(data.id);
	},
	onError: onError("Failed to remove tackled from task"),
});

export const slateFeatureMutation = createMutation({
	mutationFn: async ({ id, feature_id }: { id: string, feature_id: string }) => {
		const response = await client.api.objectives({ id }).slated.post({ id: feature_id });
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Slated feature for objective");
		invalidate('features:get');
		invalidate('objectives:get');
		invalidate(data.id);
	},
	onError: onError("Failed to update feature description"),
});

export const removeSlatedFeatureMutation = createMutation({
	mutationFn: async ({ id, feature_id }: { id: string, feature_id: string }) => {
		const response = await client.api.objectives({ id }).slated({ sid: feature_id }).delete();
		if (response.error) {
			throw new Error();
		}
		return { id };
	},
	onSuccess: (data) => {
		toast.success("Removed slated feature from objective");
		invalidate('features:get');
		invalidate('objectives:get');
		invalidate(data.id);
	},
	onError: onError("Failed to update feature description"),
});