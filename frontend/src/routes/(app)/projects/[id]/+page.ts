import type { PageLoad } from './$types';
import { client } from '@/state';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params: { id }, fetch, depends }) => {
    const { data: project, error: e } = await client.api.projects({ id }).get();

	if (project === null) {
		console.log(e);
		throw error(404, "Could not load project!");
	}

	const { data: objectives } = await client.api.projects({ id }).objectives.get();

	if (objectives === null) {
		throw error(404, "Could not load objectives!");
	}

	const { data: statuses } = await client.api.statuses.get();

	if (statuses === null) {
		throw error(404, "Could not load statuses!");
	}

	depends('project:get');

	return {
		project,
		objectives,
		statuses,
	};
};
