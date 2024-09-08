import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { toast } from "svelte-sonner";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: objectives } = await client.api.projects({ id }).objectives.get();

	if (objectives === null) {
		error(404, "Could not load objectives!");
	}

	const active_objective = objectives.find(o => o.active);

	if (active_objective === undefined) {
		toast.warning("No active objective!", {
			description: "Create one from the project's page.",
		});

		redirect(301, `/projects/${id}`);
	}

	redirect(301, `/objectives/${active_objective.id}`);
};
