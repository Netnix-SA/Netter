import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id }, depends }) => {
    const { data: product } = await client.api.products({ id }).get();

    if (!product) {
        throw error(404, "Could not find product");
    }

	const { data: components } = await client.api.products({ id }).components.get();

	if (!components) {
		throw error(404, "Could not find components");
	}

	depends("components:get");

    return {
        product,
		components,
    };
};