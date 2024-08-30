import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { App } from "../../../../backend/src/api";
import { treaty } from "@elysiajs/eden";

export const load: PageLoad = async ({ url, fetch }) => {
	// if (params.error) {
	//     throw error(400, params.error);
	// }

	// console.log(params);
	//
	const email = url.searchParams.get("email");

	if (!email) {
		throw error(400, "Email is required.");
	}

	const client = treaty<App>('localhost', { fetcher: fetch, fetch: { credentials: "include" } });

	const response = await client.api.auth.token.post({ email });

	if (response.status >= 200 && response.status < 300) {
		console.log("redirect");
    	throw redirect(301, "/");
	} else {
		console.error("failed to login!");
		throw error(400, "Invalid email.");
	}
};
