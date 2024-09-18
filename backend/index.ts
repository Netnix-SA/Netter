import Surreal from "surrealdb";
import { server } from "./src/api";
import { LocalEvents } from "./src/events";

console.log("Starting Netter API server!");

const db = new Surreal();

await db.connect(import.meta.env.DB_URL ?? "http://db:8000/rpc", {
	auth: {
		username: "root",
		password: "root",
	},
	namespace: "development",
	database: "dev",
});

const event_queue = new LocalEvents();

const app = server(db, event_queue);

// app.listen(80);

Bun.serve({
	port: 80,
	fetch: app.fetch,
});
