import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: tasks, error: e } = await client.api.projects({ id }).tasks.get();
	const { data: labels, } = await client.api.projects({ id }).labels.get();
	const { data: statuses, } = await client.api.projects({ id }).statuses.get();

	if (!tasks) {
		console.error(e);
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