// import { client } from "@/state";
import { treaty } from "@elysiajs/eden";
import type { LayoutLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { App } from "../../../../backend/src/api";

export const ssr = false;

export const load: LayoutLoad = async ({ fetch, depends }) => {
	const client = treaty<App>('localhost', { fetcher: fetch, fetch: { credentials: "include" } });

    const { data: user, error: e } = await client.api.users.me.get();

    if(!user) {
        console.error(e);
        throw error(404, "Could not load user!");
    }

    const { data: users } = await client.api.users.get();

    if(!users) {
        throw error(404, "Could not load users!");
    }

	const { data: labels } = await client.api.labels.get();

	if (labels === null) {
		throw error(404, "Could not load labels!");
	}

	const { data: statuses } = await client.api.statuses.get();

	if (statuses === null) {
		throw error(404, "Could not load labels!");
	}

	depends('pins:get');

	for (const pin of user.pinned) {
		depends(pin);
	}

	console.log("Loaded layout");

    return {
        user,
        users,
		labels,
		statuses,
    };
};
