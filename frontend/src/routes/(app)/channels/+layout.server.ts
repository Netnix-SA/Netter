import { db } from '@/server/db';
import type { Channel, Project, Task } from '@/server/db/types';
import { StringRecordId } from 'surrealdb';

export const load = async ({ fetch }) => {
	const channels = await db.select<Channel>("Channel");

	const c = channels.map(({ id, name }) => ({
		id: id.toString(),
		name,
	}));

	return {
		channels: c,
	};
};