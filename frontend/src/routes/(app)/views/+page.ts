import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async () => {
    const { data: views } = await client.api.views.get();

    if (!views) {
        throw error(404, "Could not load views!");
    }

    return {
        views,
    };
};