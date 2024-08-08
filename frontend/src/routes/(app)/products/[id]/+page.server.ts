import { client } from "@/state";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params: { id } }) => {
    const { data: project } = await client.api.products({ id }).get();

    if (!project) {
        throw error(404, "Could not load project!");
    }

    return {
        project,
    };
};