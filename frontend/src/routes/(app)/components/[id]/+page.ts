import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: component, error: e } = await client.api.components({ id }).get();

	if (component === null) {
		console.error(e);
		throw error(404, "Could not load component!");
	}

	return {
		component,
	};
};
