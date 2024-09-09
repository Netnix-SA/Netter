import { client } from "@/state";
import type { PageLoad, } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id }, depends }) => {
	const { data: product } = await client.api.products({ id }).get();

	if (!product) {
		error(404, "Could not load product!");
	}

    const { data: features, error: e } = await client.api.products({ id }).features.get();

    if (!features) {
        console.error(e);
        error(404, "Could not load features!");
    }

	depends("features:get");

    return {
		product,
        features,
    };
};