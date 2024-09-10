import { treaty } from "@elysiajs/eden";
import { writable } from "svelte/store";
import type { App } from "../../../backend/src/api";
// import { createMutation, QueryClient } from "@tanstack/svelte-query";
import { task } from "./all.svelte";
import { toast } from "svelte-sonner";
import { goto, invalidate } from "$app/navigation";
import { createMutation } from "./query";
import type { Value } from "./types";

export const client = treaty<App>('localhost', { fetch: { credentials: 'include' } });

export const commands = writable<{ name: string, commands: { name: string, key?: string, do: () => void }[] }[]>([]);

export const onError = (message: string) => () => {
	toast.error(message);
};

export const taskCreate = createMutation({
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
		// queryClient.invalidateQueries({ queryKey: ['tasks'] });
		task.value = null;
		toast.success("Created Task", {
			action: {
				label: "Open",
				onClick: () => {
					goto(`/tasks/${response.id}`);
				},
			}
		});
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
		// queryClient.invalidateQueries({ queryKey: ['pins'] });
		invalidate('pins:get');
		toast.success("Pinned item");
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
		// queryClient.invalidateQueries({ queryKey: ['tasks'] });
		invalidate('tasks:get');
		toast.success("Deleted Task");
	},
	onError: onError("Failed to delete task"),
});

export const deleteToDoMutation = createMutation({
	mutationFn: ({ id }: { id: string }) => {
		return client.api.todos({ id }).delete();
	},
	onSuccess: () => {
		toast.success("Deleted ToDo");
		// queryClient.invalidateQueries({ queryKey: ['todos'] });
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
		// queryClient.invalidateQueries({ queryKey: ['features'] });
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
		// queryClient.invalidateQueries({ queryKey: ['projects'] });
		invalidate('projects:get');
	},
	onError: onError("Failed to delete project"),
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
		// queryClient.invalidateQueries({ queryKey: ['products'] });
		invalidate('products:get');
	},
	onError: onError("Failed to delete product"),
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
		// queryClient.invalidateQueries({ queryKey: ['products'] });
		invalidate('products:get');
	},
	onError: onError("Failed to update product"),
});