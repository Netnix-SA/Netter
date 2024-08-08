import { Elysia, t } from "elysia";
import { tLabel, tLabelPost } from "./schemas";
import type { Label } from "@/server/db/types";
import { db } from "@/server/db";

export const labels = new Elysia({ prefix: "/labels", tags: ["Labels"] })

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
	const labels = await db.select<Label>("Label");

	return labels.map(({ id, title, description, color, icon }) => ({
		id: id.toString(),
		title, description, color, icon,
	}));
}, {
	response: t.Array(tLabel),
});