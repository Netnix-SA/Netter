import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: tasks } = await client.api.objectives({ id }).tasks.get();
	const { data: labels, } = await client.api.projects({ id }).labels.get();
	const { data: statuses, } = await client.api.projects({ id }).statuses.get();

    if (tasks === null) {
        throw error(404, "Could not load tasks!");
    }

	if (labels === null) {
		throw error(404, "Could not load labels!");
	}

	if (statuses === null) {
		throw error(404, "Could not load statuses!");
	}

    return {
        tasks,
		labels,
		statuses,
    };
};