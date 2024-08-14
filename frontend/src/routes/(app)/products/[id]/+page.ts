import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: project } = await client.api.products({ id }).get();

    if (!project) {
        throw error(404, "Could not load project!");
    }

    return {
        project,
        applications: client.api.products({ id }).applications.get().then(({ data }) => data ?? []),
    };
};