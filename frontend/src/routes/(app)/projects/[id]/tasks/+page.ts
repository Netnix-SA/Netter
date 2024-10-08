import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id }, depends }) => {
	const { data: project } = await client.api.projects({ id }).get();
	const { data: tasks } = await client.api.projects({ id }).tasks.get();
	const { data: labels, } = await client.api.projects({ id }).labels.get();
	const { data: statuses, } = await client.api.projects({ id }).statuses.get();

	if (!tasks) {
		error(404, "Could not load tasks!");
	}

	if (!labels) {
		error(404, "Could not load labels!");
	}

	if (!statuses) {
		error(404, "Could not load statuses!");
	}

	depends('tasks:get');

	return {
		project,
		tasks,
		labels,
		statuses,
	};
};
