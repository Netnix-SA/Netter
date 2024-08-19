import { client } from "@/state";
import type { PageLoad, } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: features, error: e } = await client.api.products({ id }).features.get();

    if (!features) {
        console.error(e);
        throw error(404, "Could not load features!");
    }

    return {
        features,
    };
};