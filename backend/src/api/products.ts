import { Elysia, NotFoundError, t } from "elysia";
import { tApplication, tComponent, tComponentId, tComponentPost, tFeature, tFeatureId, tFeaturePost, tProduct, tProductId, tProductPost } from "./schemas";
import { type Application, type Component, type Feature, type Product } from "../db/types";
import Surreal, { StringRecordId, surql } from "surrealdb";
import { map as mapFeature } from "./features";
import { map as mapComponent } from "./components";

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

	await db.query(surql`
		BEGIN TRANSACTION;
		DELETE FROM Feature WHERE product == ${product_id};
		DELETE FROM Product WHERE id == ${product_id};
		COMMIT TRANSACTION;
	`);
}, {
	params: t.Object({ id: tProductId }),
	detail: {
		description: "Deletes a product by its ID. All features associated with the product are also deleted."
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

	if (!product) {
		throw new NotFoundError("No Product with that ID exists.");
	}

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
	const [features] = await db.query<[Feature[]]>(surql`SELECT * FROM Feature where product == ${new StringRecordId(id)};`);

	return features.map(mapFeature);
}, {
	response: t.Array(tFeature),
	detail: {
		description: "Retrieves all features for a product. Features are sorted by name."
	}
})

.get("/:id/components", async ({ params: { id } }) => {
	const [components] = await db.query<[Component[]]>(surql`${new StringRecordId(id)}->needs->Component.*;`);

	console.log(components);

	return components.map(mapComponent);
}, {
	response: t.Array(tComponent),
	detail: {
		description: "Retrieves all components for a product. Components are sorted by name."
	}
})

.post("/:id/components", async ({ params: { id }, body }) => {
	const product_id = new StringRecordId(id);
	const product = await db.select<Product>(product_id);

	const [component] = await db.create<Omit<Component, "id">>("Component", { name: body.name, description: body.description, type: body.type });

	await db.query(surql`RELATE ${product_id}->needs->${component.id};`);

	return { id: component.id.toString() };
}, {
	body: tComponentPost,
	response: t.Object({ id: tComponentId }),
})

.post("/:id/features", async ({ params: { id }, body }) => {
	const product_id = new StringRecordId(id);
	const product = await db.select<Product>(product_id);

	const [feature] = await db.create<Omit<Feature, "id">>("Feature", { name: body.name, description: body.description, constraints: body.constraints, notes: body.notes, product: product_id, value: body.value });

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
