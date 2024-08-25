import { Elysia, t } from "elysia";
import { tApplication, tFeature, tProduct, tProductPost } from "./schemas";
import { type Application, type Feature, type Product } from "../db/types";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapFeature } from "./features";
import { map as mapApplication } from "./applications";

export const products = (db: Surreal) => new Elysia({ prefix: "/products", tags: ["Products"] })

.post("", async ({ body: { name, description } }) => {
	await db.create<Omit<Product, "id">>("Product", {
		name, description, applications: [],
	});
}, {
	body: tProductPost,
	detail:
	{
		description: "Creates an application under the connected user's organization"
	}
})

.get("", async () => {
	const products = await db.select<Product>("Product");

	return products.map(map);
}, {
	response: t.Array(tProduct)
})

.get("/:id", async ({ params: { id } }) => {
	const product = await db.select<Product>(new StringRecordId(id));

	return map(product);
}, {
	response: tProduct,
})

.get("/:id/features", async ({ params: { id } }) => {
	const results = await db.query<[Feature[]]>(surql`SELECT * FROM Feature where product == ${new StringRecordId(id)};`);

	const features = results[0];

	return features.map(mapFeature);
}, {
	response: t.Array(tFeature),
})

.get("/:id/applications", async ({ params: { id } }) => {
	const results = await db.query<[Application[]]>(surql`SELECT * FROM Application where product.id == ${new StringRecordId(id)};`);

	const applications = results[0];

	return applications.map(mapApplication);
}, {
	response: t.Array(tApplication),
});

export const map = ({ id, name, description }: Product) => {
	return {
		id: id.toString(),
		name, description,
	};
};
