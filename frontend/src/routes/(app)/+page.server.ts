import { db } from '@/server/db';
import type { PageServerLoad } from './$types';
import type { Project, Task } from '@/server/db/types';
import { client } from '@/state';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { data: tasks } = await client.api.tasks.get();

	return {
		tasks,
	};
};