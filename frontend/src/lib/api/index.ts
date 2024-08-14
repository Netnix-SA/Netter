import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { db } from "@/server/db";
import type { BugId, ChannelId, FeatureId, LabelId, ProductId, ProjectId, TeamId, UserId } from "@/server/db/types";

import { users } from "$lib/api/users";
import { teams } from "$lib/api/teams";
import { labels } from "$lib/api/labels";
import { bugs } from "$lib/api/bugs";
import { tasks } from "$lib/api/tasks";
import { projects } from "$lib/api/projects";
import { features } from "$lib/api/features";
import { views } from "$lib/api/views";
import { channels } from "$lib/api/channels";
import { applications } from "$lib/api/applications";
import { repositories } from "$lib/api/repositories";
import { merge_requests } from "$lib/api/merge_requests";
import { extensions } from "$lib/api/extensions";
import { products } from "./products";
import { statuses } from "./statuses";
import { messages } from "./messages";

export const server = new Elysia({ prefix: "/api" })

.use(await swagger({ path: "/docs", version: "0.0.1", documentation: { info: { title: "Netter API", version: "0.0.1", description: "Documentation for the Netter REST API" } } }))

// server.use(swagger);

// server.ws("/", {
// 	open(ws) {
// 		console.log(ws.remoteAddress, "started a live connecion to Netter.");
// 	},
// 	message(ws, message) {
// 		console.log(message);
// 	},
// })

.get("", async ({ query: { text } }) => {
	const results = await db.query<[{ id: UserId }[], { id: ProjectId }[], { id: TeamId }[], { id: LabelId }[], { id: BugId }[], { id: ChannelId }[], { id: ProductId }[], { id: FeatureId }[]]>("SELECT id FROM User WHERE full_name @@ $text; SELECT id FROM Project WHERE name @@ $text; SELECT id FROM Team WHERE name @@ $text; SELECT id FROM Task WHERE title @@ $text; SELECT id FROM Bug WHERE title @@ $text || description @@ $text; SELECT id FROM Channel WHERE name @@ $text; SELECT id FROM Product WHERE name @@ $text; SELECT id FROM Feature WHERE name @@ $text;", { text });

	const ids = results.flat();

	return ids.map(id => id.id.toString());
}, {
	response: t.Array(t.String()),
	query: t.Object({
		text: t.Optional(t.String({ maxLength: 128 })),
	}),
	detail: {
		description: "Allows searching across the querying user's whole organization",
	},
})

.use(users)
.use(teams)
.use(channels)
.use(messages)
.use(projects)
.use(bugs)
.use(features)
.use(applications)
.use(products)
.use(labels)
.use(statuses)
.use(tasks)
.use(views)
.use(repositories)
.use(merge_requests)
.use(extensions);

export type App = typeof server;