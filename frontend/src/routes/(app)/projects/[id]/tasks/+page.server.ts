import { client } from "@/state";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params: { id } }) => {
	const { data: tasks, } = await client.api.projects({ id }).tasks.get();
	const { data: labels, } = await client.api.projects({ id }).labels.get();
	const { data: statuses, } = await client.api.projects({ id }).statuses.get();

	if (!tasks) {
		throw error(404, "Could not load tasks!");
	}
	
	if (!labels) {
		throw error(404, "Could not load labels!");
	}

	if (!statuses) {
		throw error(404, "Could not load statuses!");
	}

	return {
		tasks,
		labels,
		statuses,
	};
};