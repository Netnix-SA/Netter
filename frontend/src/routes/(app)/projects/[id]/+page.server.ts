import type { PageServerLoad } from './$types';
import type { Channel, Message, Project, } from '@/server/db/types';
import { client } from '@/state';
import { error } from '@sveltejs/kit';
import { StringRecordId, surql } from 'surrealdb';

export const load: PageServerLoad = async ({ params: { id }, fetch }) => {
    const { data: project } = await client.api.projects({ id }).get();

	if (!project) {
		throw error(404, "Could not load project!");
	}

	return {
		project,
	};
};