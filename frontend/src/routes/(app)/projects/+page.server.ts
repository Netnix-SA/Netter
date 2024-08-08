import { db } from '@/server/db';
import type { PageServerLoad } from './$types';
import type { Project } from '@/server/db/types';
import { client } from '@/state';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { data: projects } = await client.api.projects.get();

	if (!projects) {
		throw new Error("Could not load projects!");
	}

	return {
		projects,
	};
};