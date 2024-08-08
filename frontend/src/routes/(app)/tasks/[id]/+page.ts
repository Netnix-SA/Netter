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

	return {
		task,
		tasks,
		labels,
		statuses,
	};
};