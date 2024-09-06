import { client } from "@/state";
import type { PageLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load: PageLoad = async ({ params: { id } }) => {
	const { data: parent } = await client.api.messages({ id }).parent.get();

	console.log(parent);

	if (parent === null) {
		error(404, "Could not load parent!");
	}

	if (parent.id.startsWith("Channel")) {
		redirect(301, `/channels/${parent.id}`);
	}

	if (parent.id.startsWith("Task")) {
		redirect(301, `/tasks/${parent.id}`);
	}
};
