import { client } from "@/state";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ depends }) => {
    const { data: products, error: e } = await client.api.products.get();

    if(!products) {
        console.error(e);
        throw error(404, "Could not load products!");
    }

	depends('products:get');

    return {
        products,
    };
};