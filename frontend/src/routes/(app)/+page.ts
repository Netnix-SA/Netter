import type { PageLoad } from './$types';
import { client } from '@/state';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
    const { data: tasks } = await client.api.tasks.get({ query: { assignee: "User:yt2hrlb0mynjar8q5la5" } });

	if (!tasks) {
		throw error(404, "Could not load tasks!");
	}

	const { data: todos } = await client.api.users.me.todos.get({ query: { resolved: false } });

	if (!todos) {
		throw error(404, "Could not load todos!");
	}

	// Get messages which are pending resolution and where written by the current user
	const { data: inquiries } = await client.api.messages.get({ query: { author: "User:yt2hrlb0mynjar8q5la5", resolved: false } });

	if (!inquiries) {
		throw error(404, "Could not load messages!");
	}

	// Get messages which are pending resolution where the current user is mentioned
	const { data: pending_mentions } = await client.api.messages.get({ query: { resolved: false, was_mentioned: true } });

	if (!inquiries) {
		throw error(404, "Could not load messages!");
	}

	const { data: labels } = await client.api.labels.get({ query: {} });

	if (!labels) {
		throw error(404, "Could not load labels!");
	}

	return {
		tasks,
		todos,
		messages: inquiries,
		labels,
		pending_mentions,
	};
};
