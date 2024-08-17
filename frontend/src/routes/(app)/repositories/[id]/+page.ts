import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: repository } = await client.api.repositories({ id }).get();

    if (!repository) {
        throw error(404, "Could not load repository!");
    }

    return {
        repository,
    };
};