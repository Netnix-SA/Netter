import type { Channel, Project, Task } from '@/server/db/types';
import { client } from '@/state.js';
import { error } from '@sveltejs/kit';
import { StringRecordId } from 'surrealdb';

export const load = async ({ fetch }) => {
	const { data: channels } = await client.api.channels.get();

	if (!channels) {
		throw error(404, 'Could not load channels');
	}

	return {
		channels,
	};
};