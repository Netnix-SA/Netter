import type { PageLoad } from './$types';
import { client } from '@/state';

export const load: PageLoad = async ({ params, fetch, depends }) => {
    const { data: projects, error: e } = await client.api.projects.get();

	if (!projects) {
		throw new Error("Could not load projects!");
	}

	depends('projects:get');

	for (const project of projects) {
		depends(project.id);
	}

	return {
		projects,
	};
};