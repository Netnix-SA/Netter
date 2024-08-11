import type { Message } from "@/server/db/types";

export const map = ({ id, body, author, date }: Message) => ({
	id: id.toString(),
	body,
	author: {
		id: author.toString(),
	},
	date,
});