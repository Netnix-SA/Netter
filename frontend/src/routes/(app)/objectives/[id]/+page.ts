import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { client } from "@/state";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: objective } = await client.api.objectives({ id }).get();

    if (objective === null) {
        throw error(404, "Could not load objective!");
    }

    const { data: features } = await client.api.objectives({ id }).features.get();

    if (features === null) {
        throw error(404, "Could not load features!");
    }

    return {
        objective,
        features,
    };
};