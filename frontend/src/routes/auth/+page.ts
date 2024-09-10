import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { client } from "@/state";

export const load: PageLoad = async ({ url }) => {
	// if (params.error) {
	//     throw error(400, params.error);
	// }

	// console.log(params);
	//
	const email = url.searchParams.get("email");

	if (!email) {
		throw error(400, "Email is required.");
	}

	const response = await client.api.auth.token.post({ email });

	console.log(response);

	if (response.status >= 200 && response.status < 300) {
		console.log("redirect");
    	redirect(301, "/");
	} else {
		error(400, response.error.value);
	}
};
