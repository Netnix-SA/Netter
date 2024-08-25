import { Elysia, t } from "elysia";
import { tLabel, tLabelPost } from "./schemas";
import type { Label } from "../db/types";
import Surreal, { surql } from "surrealdb";

export const labels = (db: Surreal) => new Elysia({ prefix: "/labels", tags: ["Labels"] })

.post("", async ({ body }) => {
	await db.create<Omit<Label, "id">>("Label", {
		title: body.title,
		description: "",
		color: body.color,
		icon: body.icon,
	})
}, {
	body: tLabelPost,
	detail: {
		description: "Creates a label under the querying user's organization.",
	},
})

.get("", async () => {
	const results = await db.query<[Label[]]>(surql`SELECT * FROM Label WHERE !owner;`);

	const labels = results[0];

	return labels.map(map);
}, {
	response: t.Array(tLabel),
	detail: {
		description: "Gets the labels for the querying user's organization. Does not include any project/team specific labels.",
	},
});

export const map = ({ id, title, description, color, icon }: Label) => ({
	id: id.toString(),
	title, description,
	color, icon,
});
