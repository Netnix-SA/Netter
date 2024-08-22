import { client } from "@/state";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: feature } = await client.api.features({ id }).get();

	if (!feature) {
		throw error(404, "Could not load feature!");
	}

	const { data: bugs } = await client.api.features({ id }).bugs.get();

	if (!bugs) {
		throw error(404, "Could not load bugs!");
	}

	const { data: tasks } = await client.api.features({ id }).tasks.get();

	if (!tasks) {
		throw error(404, "Could not load tasks!");
	}

	const { data: components } = await client.api.features({ id }).components.get();

	if (components === null) {
		throw error(404, "Could not load components!");
	}

	return {
		feature,
		bugs,
		tasks,
		components,
	};
};
