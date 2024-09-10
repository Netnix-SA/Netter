import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';

import type { BugId, ChannelId, FeatureId, LabelId, ProductId, ProjectId, TeamId, User, UserId } from "../db/types";

import { users } from "./users";
import { teams } from "./teams";
import { labels } from "./labels";
import { bugs } from "./bugs";
import { tasks } from "./tasks";
import { projects } from "./projects";
import { features } from "./features";
import { components } from "./components";
import { views } from "./views";
import { todos } from "./todos";
import { channels } from "./channels";
import { repositories } from "./repositories";
import { merge_requests } from "./merge_requests";
import { extensions } from "./extensions";
import { products } from "./products";
import { statuses } from "./statuses";
import { messages } from "./messages";
import { objectives } from "./objectives";
import Surreal, { StringRecordId, surql } from "surrealdb";
import type { Events } from "../events";
import { tClasses } from "./schemas";

export const server = (db: Surreal, event_queue: Events) => new Elysia({ prefix: "/api" })

.use(cors())
.use(swagger({ path: "/docs", version: "0.0.1", documentation: { info: { title: "Netter API", version: "0.0.1", description: "Documentation for the Netter REST API" } } }))
.use(jwt({ name: 'jwt', secret: 'Fischl von Luftschloss Narfidort' }))

.post("/auth/token", async ({ body, jwt, cookie: { auth } }) => {
	const email = body.email;

	const results = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${email};`);
	const users = results[0];
	const user = users[0];

	if (user === undefined) {
		throw new Error("User not found.");
	}

	const value = await jwt.sign({ sub: user.id.toString() });

	auth.set({
		value,
		httpOnly: true,
		sameSite: "strict",
		maxAge: 60 * 60 * 24 * 7,
	});
}, {
	body: t.Object({ email: t.String() }),
})

.ws("/ws", {
	open(ws) {
		console.log(ws.remoteAddress, "started a live connecion to Netter.");
		ws.subscribe("EVENT:Connection");
		ws.publish("EVENT:Connection", { message: "Connected to Netter." });
	},
	message(ws, message) {

		console.log(message);
	},
})

.get("", async ({ query: { text } }) => {
	const results = await db.query<[{ id: UserId, title: string }[], { id: ProjectId, title: string }[], { id: TeamId, title: string }[], { id: LabelId, title: string }[], { id: BugId, title: string }[], { id: ChannelId, title: string }[], { id: ProductId, title: string }[], { id: FeatureId, title: string }[]]>("SELECT id, full_name as title FROM User WHERE full_name @@ $text; SELECT id, name as title FROM Project WHERE name @@ $text; SELECT id, name as title FROM Team WHERE name @@ $text; SELECT id, title FROM Task WHERE title @@ $text; SELECT id, title FROM Bug WHERE title @@ $text || description @@ $text; SELECT id, name as title FROM Channel WHERE name @@ $text; SELECT id, name as title FROM Product WHERE name @@ $text; SELECT id, name as title FROM Feature WHERE name @@ $text;", { text });

	const ids = results.flat();

	return ids.map(({ id, title }) => ({ id: id.toString(), title }));
}, {
	response: t.Array(t.Object({ id: t.String(), title: t.String() })),
	query: t.Object({
		text: t.Optional(t.String({ maxLength: 128 })),
		class: t.Optional(tClasses),
	}),
	detail: {
		description: "Allows searching across the querying user's whole organization",
	},
})

.get("/metadata/:id", async ({ params: { id } }) => {
	const table = id.split(":")[0];
	const oid = id.split(":")[1];

	const results = await db.query<[any[]]>(`SELECT id, name, title, full_name FROM ${table} WHERE id = $id;`, { id: new StringRecordId(id) });

	const metadata = results[0][0];

	return {
		id: metadata.id.toString(),
		title: metadata.title || metadata.name || metadata.full_name,
	};
}, {
	params: t.Object({ id: t.String() }),
	response: t.Object({ id: t.String(), title: t.String() }),
})

// .resolve({ as: 'global' }, async ({ jwt, cookie: { auth } }) => {
// 	const token = await jwt.verify(auth.value);

// 	if (!token) {
// 		throw new Error("Invalid token.");
// 	}

// 	return { id: token.sub };
// })
.use(users(db))
.use(teams(db))
.use(channels(db))
.use(messages(db))
.use(projects(db))
.use(bugs(db))
.use(features(db))
.use(components(db))
.use(products(db))
.use(labels(db))
.use(statuses(db))
.use(tasks(db, event_queue))
.use(todos(db))
.use(views(db))
.use(objectives(db))
.use(repositories(db))
.use(merge_requests(db))
.use(extensions(db));

// The uuid of the live query will be returned
// const queryUuid = await db.live(
// 	"Message",
// 	// The callback function takes two arguments: the 'action' and 'result' properties
// 	(action, result) => {
// 		// action can be: 'CREATE', 'UPDATE', 'DELETE' or 'CLOSE'
// 	    if (action === 'CREATE') {
// 			server.server?.publish("EVENT:Message", JSON.stringify(result));
// 		}
// 	}
// )

export type App = ReturnType<typeof server>;
