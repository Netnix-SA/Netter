import { client } from "@/state";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params: { id } }) => {
    const { data: applications } = await client.api.projects({ id }).applications.get();

    if (!applications) {
        throw error(404, "Failed to load applications!");
    }

    return {
        applications
    };
};