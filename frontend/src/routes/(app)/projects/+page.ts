import type { PageLoad } from './$types';
import { client } from '@/state';

export const load: PageLoad = async ({ params, fetch }) => {
    const { data: projects } = await client.api.projects.get();

	if (!projects) {
		throw new Error("Could not load projects!");
	}

	return {
		projects,
	};
};