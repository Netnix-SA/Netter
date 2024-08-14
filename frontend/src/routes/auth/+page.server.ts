import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    // if (params.error) {
    //     throw error(400, params.error);
    // }

    // console.log(params);
};