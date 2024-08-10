import type { PageLoad } from './$types';
import { client } from '@/state';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
    const { data: tasks } = await client.api.tasks.get({ query: {} });

	if (!tasks) {
		throw error(404, "Could not load tasks!");
	}

	const { data: todos } = await client.api.users.me.todos.get();

	if (!todos) {
		throw error(404, "Could not load todos!");
	}

	return {
		tasks,
		todos,
	};
};