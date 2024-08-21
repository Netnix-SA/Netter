import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: view, error: e } = await client.api.views({ id }).get();

	if (view === null) {
		throw error(404, "Could not load view!");
	}

	const { data } = await client.api.views({ id }).data.get();

	if (data === null) {
		throw error(404, "Could not load data!");
	}

	const { data: labels, } = await client.api.projects({ id }).labels.get();
	const { data: statuses, } = await client.api.projects({ id }).statuses.get();

	if (labels === null) {
		throw error(404, "Could not load labels!");
	}

	if (statuses === null) {
		throw error(404, "Could not load statuses!");
	}

	const { data: users } = await client.api.users.get();

	if (users === null) {
		throw error(404, "Could not load users!");
	}

	return {
		view,
		data,
		labels,
		statuses,
		users,
	};
};