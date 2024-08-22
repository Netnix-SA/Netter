import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: objectives } = await client.api.projects({ id }).objectives.get();

	if (objectives === null) {
		throw error(404, "Could not load objectives!");
	}

	const active_objective = objectives.find(o => o.active);

	if (active_objective === undefined) {
		throw error(404, "No active objective!");
	}

	throw redirect(301, `/objectives/${active_objective.id}`);
};
