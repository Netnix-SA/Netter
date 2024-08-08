import { client } from "@/state";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const { data: products } = await client.api.products.get();

    if(!products) {
        throw error(404, "Could not load products!");
    }

    return {
        products,
    };
};