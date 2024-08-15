import { client } from "@/state";
import type { LayoutLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutLoad = async () => {
    const { data: repositories } = await client.api.repositories.get();

    if(!repositories) {
        throw error(404, "Could not load repositories!");
    }

    return {
        repositories,
    };
};