import type { PageLoad } from './$types';
import { client } from '@/state';

export const load: PageLoad = async ({ params: { id: channel_id }, fetch }) => {
	return {
		messages: client.api.channels({ id: channel_id }).messages.get().then(({ data }) => data ?? []),
	};
};