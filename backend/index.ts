import Surreal from "surrealdb";
import { server } from "./src/api";
import { LocalEvents } from "./src/events";

console.log("Starting Netter API server!");

const db = new Surreal();

await db.connect(import.meta.env.DB_URL ?? "NO_DATABASE_PROVIDED", {
	auth: {
		username: import.meta.env.DB_USER ?? "NO_USER_PROVIDED",
		password: import.meta.env.DB_PASSWORD ?? "NO_PASSWORD_PROVIDED",
	},
	namespace: import.meta.env.DB_NAMESPACE ?? "NO_NAMESPACE_PROVIDED",
	database: import.meta.env.DB_NAME ?? "NO_DATABASE_PROVIDED",
});

const event_queue = new LocalEvents();

const app = server(db, event_queue);

// app.listen(80);

Bun.serve({
	port: 80,
	fetch: app.fetch,
});
