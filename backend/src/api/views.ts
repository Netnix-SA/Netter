import { Elysia, t } from "elysia";
import { tFeature, tTask, tView, tViewPost } from "./schemas";
import type { LabelId, Task, View } from "../db/types";
import Surreal, { StringRecordId } from "surrealdb";
import { map as mapTask } from "./tasks";

export const views = (db: Surreal) => new Elysia({ prefix: "/views", tags: ["Views"] })

.post("", async ({ body }) => {
	await db.create<Omit<View, "id">>("View", {
		name: body.name,
		filters: body.filters.map(filter => ({
			type: filter.type,
			operation: filter.operation,
			value: filter.value,
		})),
	});
}, {
	body: tViewPost,
	detail: {
		description: "Creates a view under the connected user's organization.",
	},
})

.get("", async ({}) => {
	const views = await db.select<View>("View");

	return views.map(map);
}, {
	response: t.Array(tView),
	detail: {
		description: "Gets all the views under the connected user's organization.",
	},
})

.get("/:id", async ({ params: { id } }) => {
	const view = await db.select<View>(new StringRecordId(id));

	return map(view);
}, {
	response: tView,
	detail: {
		description: "Gets the view by id.",
	},
})

.get("/:id/data", async ({ params: { id } }) => {
	const view = await db.select<View>(new StringRecordId(id));

	let query_pieces: string[] = [];
	let variables: { text?: string, labels: LabelId[] } = { labels: [] };

	view.filters.forEach(filter => {
		switch (filter.type) {
			case "State": {
				return;
			}
			case "Status": {
				return;
			}
			case "Assignee": {
				return;
			}
			case "Creator": {
				return;
			}
			case "Priority": {
				return;
			}
			case "Effort": {
				return;
			}
			case "Value": {
				return;
			}
			case "Label": {
				switch (filter.operation) {
					case "IN": {
						query_pieces.push(`labels CONTAINS $labels[${variables.labels.length}]`);
						variables.labels.push(filter.value);
						return;
					}
					case "NOT IN": {
						query_pieces.push(`labels NOT CONTAINS $labels[${variables.labels.length}]`);
						variables.labels.push(filter.value);
						return;
					}
				}
			}
			case "Text": {
				query_pieces.push(`title @@ $text`);
				variables.text = filter.value;
				return;
			}
		}
	});

	const query = "SELECT *, (SELECT * FROM updates ORDER BY date DESC)[0].value as progress FROM Task WHERE " + query_pieces.join(" AND ");

	const results = await db.query<[(Task & { progress: number | undefined })[]]>(query, variables);

	const tasks = results[0];

	return tasks.map(mapTask);
}, {
	response: t.Array(tTask),
	detail: {
		description: "Returns the content defined by the view.",
	},
});

export const map = ({ id, name, filters }: View) => ({
	id: id.toString(),
	name,
	filters: filters.map(filter => ({
		type: filter.type,
		operation: filter.operation,
		value: filter.value?.toString(),
	})),
});
