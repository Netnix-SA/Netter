import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { client } from '@/state';

export const load: PageLoad = async ({ params: { id: channel_id }, fetch }) => {
	const { data: channel } = await client.api.channels({ id: channel_id }).get();

	if (!channel) {
		throw error(404, 'Could not load channel!');
	}

	return {
		channel,
		messages: client.api.channels({ id: channel_id }).messages.get().then(({ data }) => data ?? []),
	};
};