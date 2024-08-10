import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: product } = await client.api.products({ id }).get();

    if (!product) {
        throw error(404, "Could not find product");
    }

    return {
        product,
        applications: client.api.products({ id }).applications.get().then(({ data }) => data ?? []),
    };
};