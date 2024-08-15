import { Elysia, t } from "elysia";
import { tFeature, tTask, tView, tViewPost } from "./schemas";
import { db } from "@/server/db";
import type { Task, View } from "@/server/db/types";
import { StringRecordId } from "surrealdb";

export const views = new Elysia({ prefix: "/views", tags: ["Views"] })

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

	return views.map(view => ({
		id: view.id.toString(),
		name: view.name,
		filters: view.filters.map(filter => ({
			type: filter.type,
			operation: filter.operation,
			value: filter.value,
		})),
	}));
}, {
	response: t.Array(tView),
	detail: {
		description: "Gets all the views under the connected user's organization.",
	},
})

.get("/:id/query", async ({ params: { id } }) => {
	const view = await db.select<View>(new StringRecordId(id));

	let query_pieces: string[] = [];
	let variables: { text?: string, labels: StringRecordId[] } = { labels: [] };

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
					case "=": {
						query_pieces.push(`labels CONTAINS $labels[${variables.labels.length}]`);
						variables.labels.push(new StringRecordId(filter.value));
						return;
					}
					case "!=": {
						query_pieces.push(`labels NOT CONTAINS $labels[${variables.labels.length}]`);
						variables.labels.push(new StringRecordId(filter.value));
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

	const query = "SELECT * FROM Task WHERE " + query_pieces.join(" AND ");

	const results = await db.query<[Task[]]>(query, variables);

	const tasks = results[0];

	return tasks.map(task => ({
		id: task.id.toString(),
		name: task.title,
	}));
}, {
	response: t.Array(tTask),
	detail: {
		description: "Returns the content defined by the view.",
	},
})