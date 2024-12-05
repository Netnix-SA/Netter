import { Elysia, NotFoundError, t } from "elysia";
import { tLabel, tLabelId, tLabelPost } from "./schemas";
import type { Label } from "../db/types";
import Surreal, { StringRecordId, surql } from "surrealdb";

export const labels = (db: Surreal) => new Elysia({ prefix: "/labels", tags: ["Labels"] })

.post("", async ({ body }) => {
	const label = await db.create<Omit<Label, "id">>("Label", {
		title: body.title,
		description: "",
		color: body.color,
		icon: body.icon,
	});

	return { id: label.id.toString(), };
}, {
	body: tLabelPost,
	response: t.Object({ id: tLabelId }),
	detail: {
		description: "Creates a label under the querying user's organization.",
	},
})

.get("", async () => {
	const [labels] = await db.query<[Label[]]>(surql`SELECT * FROM Label WHERE !owner;`);

	return labels.map(map);
}, {
	response: t.Array(tLabel),
	detail: {
		description: "Gets the labels for the querying user's organization. Does not include any project/team specific labels.",
	},
})

.get("/:id", async ({ params: { id } }) => {
	const [[label]] = await db.query<[Label[]]>(surql`SELECT * FROM Label WHERE id = ${new StringRecordId(id)} AND !owner;`);

	console.log(label);

	if (!label) {
		throw new NotFoundError("Label not found.");
	}

	return map(label);
}, {
	params: t.Object({ id: tLabelId }),
	response: tLabel,
	detail: {
		description: "Gets a label by its ID.",
	},
});

export const map = ({ id, title, description, color, icon }: Label) => ({
	id: id.toString(),
	title, description,
	color, icon,
});
