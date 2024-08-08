import type { PageServerLoad } from './$types';
import type { Channel, Message, } from '@/server/db/types';
import { client } from '@/state';
import { error } from '@sveltejs/kit';
import { StringRecordId, surql } from 'surrealdb';

export const load: PageServerLoad = async ({ params: { id: channel_id }, fetch }) => {
	const { data: messages } = await client.api.channels({ id: channel_id }).messages.get();

	if (!messages) {
		throw error(404, "Could not load messages!");
	}

	return {
		messages,
	};
};