import { db } from '@/server/db';
import type { PageServerLoad } from './$types';
import type { Project, Task } from '@/server/db/types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const tasks = await db.select<Task>("Task");

	const t = tasks.map(task => ({
		id: task.id.toString(),
		name: task.title,
	}));

	return {
		tasks: t,
	};
};