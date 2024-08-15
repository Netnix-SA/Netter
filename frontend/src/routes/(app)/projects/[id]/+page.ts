import type { PageLoad } from './$types';
import { client } from '@/state';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params: { id }, fetch }) => {
    const { data: project } = await client.api.projects({ id }).get();

	if (!project) {
		throw error(404, "Could not load project!");
	}

	return {
		project,
	};
};