import { Elysia, t } from "elysia";
import { tApplication, tFeature, tFeatureId, tFeaturePost, tProduct, tProductId, tProductPost } from "./schemas";
import { type Application, type Feature, type Product } from "../db/types";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapFeature } from "./features";

export const products = (db: Surreal) => new Elysia({ prefix: "/products", tags: ["Products"] })

.post("", async ({ body: { name, description } }) => {
	const product = await db.create<Omit<Product, "id">>("Product", {
		name, description,
		created: new Date(),
		applications: [],
	});

	return { id: product.id.toString() };
}, {
	body: tProductPost,
	response: t.Object({ id: tProductId }),
	detail:
	{
		description: "Creates an application under the connected user's organization"
	}
})

.delete("/:id", async ({ params: { id } }) => {
	const product_id = new StringRecordId(id);

	await db.delete<Product>(product_id);
}, {
	params: t.Object({ id: tProductId }),
	detail: {
		description: "Deletes a product by its ID"
	}
})

.get("", async () => {
	const [products] = await db.query<[Product[]]>(surql`SELECT * FROM Product ORDER BY created DESC;`);

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

.patch("/:id", async ({ params: { id }, body }) => {
	const product_id = new StringRecordId(id);

	let product = {};

	if (body.name !== undefined) { product = { ...product, name: body.name }; }
	if (body.description !== undefined) { product = { ...product, description: body.description }; }

	await db.merge<Product>(product_id, product);
},{
	body: t.Object({ name: t.Optional(t.String()), description: t.Optional(t.String()) }),
})

.get("/:id/features", async ({ params: { id } }) => {
	const results = await db.query<[Feature[]]>(surql`SELECT * FROM Feature where product == ${new StringRecordId(id)} ORDER BY name ASC;`);

	const features = results[0];

	return features.map(mapFeature);
}, {
	response: t.Array(tFeature),
	detail: {
		description: "Retrieves all features for a product. Features are sorted by name."
	}
})

.post("/:id/features", async ({ params: { id }, body }) => {
	const product_id = new StringRecordId(id);
	const product = await db.select<Product>(product_id);

	const feature = await db.create<Omit<Feature, "id">>("Feature", { name: body.name, description: body.description, constraints: body.constraints, notes: body.notes, product: product_id, value: body.value });

	return { id: feature.id.toString() };
}, {
	body: tFeaturePost,
	response: t.Object({ id: tFeatureId }),
});

export const map = ({ id, name, description }: Product) => {
	return {
		id: id.toString(),
		name, description,
	};
};
