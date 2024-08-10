import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: bug } = await client.api.bugs({ id }).get();

    if (!bug) {
        throw error(404, "Could not load bug!");
    }

    return {
        bug,
    };
};