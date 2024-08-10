import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
    const { data: application } = await client.api.applications({ id }).get();

    if (!application) {
        throw error(404, "Could not load application!");
    }

    return {
        application,
        bugs: client.api.applications({ id }).bugs.get().then(({ data }) => data?.bugs ?? []),
    };
};