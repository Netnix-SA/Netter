import Surreal from "surrealdb";
import { server } from "./src/api";

console.log("Starting Netter API server!");

const db = new Surreal();

await db.connect("http://db:8000/rpc", {
	auth: {
		username: "root",
		password: "root",
	},
	namespace: "development",
	database: "dev",
});

const elysia = server(db);

// server.listen(80);
//

Bun.serve({
    port: 80,
    fetch: elysia.fetch,
});
