import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { client } from "@/state";

export const load: PageLoad = async ({ url }) => {
	console.log("redirect");
	redirect(301, "/");
};
