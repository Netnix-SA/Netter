import { client } from '@/state';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const { data: tasks } = await client.api.tasks.get();

	if (!tasks) {
		throw error(404, 'Could not load tasks!');
	}

	return {
		tasks,
	};
};