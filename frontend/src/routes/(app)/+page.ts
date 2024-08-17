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

	const { data: messages } = await client.api.messages.get({ query: { author: "User:yt2hrlb0mynjar8q5la5", resolved: false } });

	if (!messages) {
		throw error(404, "Could not load messages!");
	}

	const { data: labels } = await client.api.labels.get({ query: {} });

	if (!labels) {
		throw error(404, "Could not load labels!");
	}

	return {
		tasks,
		todos,
		messages,
		labels,
	};
};