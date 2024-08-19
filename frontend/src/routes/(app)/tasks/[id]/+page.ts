import { client } from '@/state';
import type { PageLoad } from './$types';
import { StringRecordId } from 'surrealdb';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params: { id }, fetch }) => {
	const { data: task } = await client.api.tasks({ id }).get();
	const { data: tasks } = await client.api.tasks.get();
	const { data: statuses } = await client.api.statuses.get();
	const { data: labels } = await client.api.labels.get();

	if (!task) {
		throw error(404, "Failed to get task!");
	}

	if (!tasks) {
		throw error(404, "Failed to get tasks!");
	}

	if (!labels) {
		throw error(404, "Failed to get labels!");
	}

	if (!statuses) {
		throw error(404, "Failed to get statuses!");
	}

	const { data: channel } = await client.api.tasks({ id }).channel.get();

	if (!channel) {
		throw error(404, "Failed to get channel!");
	}

	return {
		task,
		tasks,
		labels,
		statuses,
		channel,
		messages: client.api.channels({ id: channel.id }).messages.get().then(({ data }) => data ?? []),
		related: client.api.tasks({ id }).related.get().then(({ data }) => data ?? []),
		blockers: client.api.tasks({ id }).blockers.get().then(({ data }) => data ?? []),
		children: client.api.tasks({ id }).children.get().then(({ data }) => data ?? []),
		tackled: client.api.tasks({ id }).tackled.get().then(({ data }) => data ?? []),
	};
};