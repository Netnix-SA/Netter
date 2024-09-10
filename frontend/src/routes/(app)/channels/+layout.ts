import { client } from '@/state.js';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	const { data: channels } = await client.api.channels.get();

	if (!channels) {
		throw error(404, 'Could not load channels');
	}

	return {
		channels,
	};
};