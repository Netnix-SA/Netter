import { client } from "@/state";
import type { LayoutLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const ssr = false;

export const load: LayoutLoad = async () => {
    const { data: user, error: e } = await client.api.users.me.get();

    if(!user) {
        console.error(e);
        throw error(404, "Could not load user!");
    }

    const { data: users } = await client.api.users.get();

    if(!users) {
        throw error(404, "Could not load users!");
    }

    return {
        user,
        users,
    };
};