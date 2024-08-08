import { client } from "@/state";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params: { id } }) => {
    const { data: feature } = await client.api.features({ id }).get();

    if (!feature) {
        throw error(404, "Could not load feature!");
    }

    return {
        feature,
    };
};