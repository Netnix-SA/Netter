import { treaty } from "@elysiajs/eden";
import { writable } from "svelte/store";
import type { App } from "../../../backend/src/api";
// import { createMutation, QueryClient } from "@tanstack/svelte-query";
import { task, todo } from "./all.svelte";
import { toast } from "svelte-sonner";
import { goto, invalidate } from "$app/navigation";
import { createMutation } from "./query";
import type { Value } from "./types";

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
		} else {
			return response.data;
		}
	},
	onSuccess: () => {
		toast.success("Deleted Task");
		invalidate('tasks:get');
	},
	onError: onError("Failed to delete task"),
});

export const deleteToDoMutation = createMutation({
	mutationFn: ({ id }: { id: string }) => {
		return client.api.todos({ id }).delete();
	},
	onSuccess: () => {
		toast.success("Deleted ToDo");
		invalidate('todos:get');
	},
	onError: onError("Failed to delete ToDo"),
});

export const updateFeatureMutation = createMutation({
	mutationFn: async ({ id, name, description, constraints, notes, value }: { id: string, name: string, description: string, constraints: string, notes: string, value: Value }) => {
		const response = await client.api.features({ id }).patch({ name, description, constraints, notes, value });
		if (response.error) {
			throw new Error();
		}
	},
	onSuccess: () => {
		toast.success("Updated Feature");
		invalidate('features:get');
	},
	onError: onError("Failed to update feature"),
});

export const deleteProjectMutation = createMutation({
	mutationFn: async (id: string) => {
		const response = await client.api.projects({ id }).delete();
		if (response.error) {
			throw new Error();
		}
	},
	onSuccess: () => {
		toast.success("Deleted Project");
		invalidate('projects:get');
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

export const createObjectiveMutation = createMutation({
	mutationFn: async () => {
		console.log("Creating objective");
		const response = await client.api.projects({ id: project.id }).objectives.post({ title: "New objective", description: "Objective description" });
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
	},
	onSuccess: () => {
		toast.success("Updated Product");
		invalidate('products:get');
	},
	onError: onError("Failed to update product"),
});