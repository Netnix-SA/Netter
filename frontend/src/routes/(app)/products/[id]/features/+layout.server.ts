import { client } from "@/state";
import type { LayoutServerLoad, } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ params: { id } }) => {
    const { data: features } = await client.api.products({ id }).features.get();

    if (!features) {
        throw error(404, "Could not load features!");
    }

    return {
        features,
    };
};