import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { client } from "@/state";

export const load: PageLoad = async ({ params: { id }, depends }) => {
    const { data: objective } = await client.api.objectives({ id }).get();

    if (objective === null) {
        error(404, "Could not load objective!");
    }

    const { data: features } = await client.api.objectives({ id }).features.get();

    if (features === null) {
        error(404, "Could not load features!");
    }

	const { data: statistics } = await client.api.objectives({ id }).statistics.get();

	if (statistics === null) {
		error(404, "Could not load statistics!");
	}

	depends(`features:get`);
	depends(`objectives:get`);

    return {
        objective,
        features,
		statistics,
    };
};