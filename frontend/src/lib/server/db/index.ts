import Surreal from "surrealdb";

export const db = new Surreal();

await db.connect("http://db:8000/rpc", {
	auth: {
		username: "root",
		password: "root",
	},
	namespace: "development",
	database: "dev",
});