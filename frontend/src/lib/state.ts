import { treaty } from "@elysiajs/eden";
import { writable } from "svelte/store";
import type { App } from "../../../backend/src/api";
// import { createMutation, QueryClient } from "@tanstack/svelte-query";
import { task } from "./all.svelte";
import { toast } from "svelte-sonner";
import { goto, invalidate } from "$app/navigation";

export const client = treaty<App>('localhost', { fetch: { credentials: 'include' } });

export const commands = writable<{ name: string, commands: { name: string, key?: string, do: () => void }[] }[]>([]);

export const onError = (message: string) => () => {
	toast.error(message);
};

class QueryClient {};

function createMutation<ARGS extends any[], R, E>({ mutationFn, onSuccess, onError } : { mutationFn: (...args: ARGS) => Promise<R>, onSuccess: (data: R) => void; onError: (error: Error) => void; }) {
	return (queryClient: QueryClient) => {
		return async (...args: ARGS) => {
			try {
				const data = await mutationFn(...args);
				onSuccess(data);
			} catch (e) {
				onError(e);
			}
		};
	};
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
		toast.success("Pinned Task");
	},
	onError: onError("Failed to pin task"),
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