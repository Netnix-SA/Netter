import { client } from "@/state";
import type { LayoutLoad, } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutLoad = async ({ params: { id } }) => {
    const { data: features } = await client.api.products({ id }).features.get();

    if (!features) {
        throw error(404, "Could not load features!");
    }

    return {
        features,
    };
};