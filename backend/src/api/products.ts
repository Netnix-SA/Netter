import { Elysia, t } from "elysia";
import { tApplication, tFeature, tFeatureId, tFeaturePost, tProduct, tProductId, tProductPost } from "./schemas";
import { type Application, type Feature, type Product } from "../db/types";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapFeature } from "./features";
import { map as mapApplication } from "./applications";

export const products = (db: Surreal) => new Elysia({ prefix: "/products", tags: ["Products"] })

.post("", async ({ body: { name, description } }) => {
	const products = await db.create<Omit<Product, "id">>("Product", {
		name, description, applications: [],
	});

	const product = products[0];

	return { id: product.id.toString() };
}, {
	body: tProductPost,
	response: t.Object({ id: tProductId }),
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

.post("/:id/features", async ({ params: { id }, body }) => {
	const product_id = new StringRecordId(id);
	const product = await db.select<Product>(product_id);

	const [feature] = await db.create<Omit<Feature, "id">>("Feature", { name: body.name, description: body.description, constraints: body.constraints, notes: body.notes, product: product_id, value: body.value });

	return { id: feature.id.toString() };
}, {
	body: tFeaturePost,
	response: t.Object({ id: tFeatureId }),
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
