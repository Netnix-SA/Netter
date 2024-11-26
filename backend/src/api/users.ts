import Surreal, { RecordId, StringRecordId } from "surrealdb";
import { Elysia, NotFoundError, t } from "elysia";

import { type User, type ToDo, type Colors } from "../db/types";
import { tUserPost, tUser, tToDo, tToDoPost, tColors, tUserId } from "./schemas";
import { map as mapToDo } from "./todos";
import { user } from "../session";

export const users = (db: Surreal) => new Elysia({ prefix: "/users", tags: ["Users"] })

.use(user)

.post("", async ({ body }) => {
	let handle: string;

	if (body.handle !== undefined) {
		handle = body.handle;
	} else {
		let h = body.email.split('@')[0];

		if (!h) {
			throw new NotFoundError("Invalid email address.");
		}

		handle = h;
	}

	// TODO: check email address against organization's whitelist

	let rows = await db.query<[User[]]>("SELECT * FROM User WHERE email = $email OR handle = $handle;", { email: body.email, handle: body.handle });

	if (rows[0].length > 0) {
		throw new NotFoundError("A user with this handle or email already exists.");
	}

	const user = await db.create<Omit<User, "id">>("User", { email: body.email, full_name: body.full_name, handle, color: "Green/Light" });

	return { id: user.id.toString() };
}, {
	body: tUserPost,
	response: t.Object({ id: tUserId }),
	detail: {
		description: `Creates a user under the querying user's organization.
		If no handle is provided the user's handle will be set as the username of the email.
		This method will fail if the handle or email already exists.
		This method will fail if the email's domain is not allowed in the organization.`,
	}
}) // TODO: put after auth

.get("", async () => {
	const users = await db.select<User>("User");

	return users.map(map)
}, {
	response: t.Array(tUser),
	detail: {
		description: "Returns all users that belong to the querying user's organization.",
	}
})

.patch("/me", async ({ body, user }) => {
	let u: { full_name?: String, color?: Colors } = {};

	if (body.full_name !== undefined) {
		u.full_name = body.full_name;
	}

	if (body.color !== undefined) {
		u.color = body.color;
	}

	await db.merge<User>(new StringRecordId(user.sub), u);
}, {
	body: t.Object({
		full_name: t.Optional(t.String()),
		color: t.Optional(tColors),
	})
})

.get("/me", async ({ user }) => {
	const u = await db.select<User>(new StringRecordId(user.sub));

	if (!u) {
		throw new NotFoundError("User not found.");
	}

	return map(u);
}, {
	response: tUser,
	detail: {
		description: "Returns the user that is currently logged in.",
	}
})

.get("/me/todos", async ({ query: { resolved }, user }) => {
	const results = await db.query<[ToDo[]]>("SELECT * FROM ToDo WHERE owner == $owner AND done == $resolved;", { owner: new StringRecordId(user.sub), resolved });

	const todos = results[0];

	return todos.map(mapToDo);
}, {
	response: t.Array(tToDo),
	query: t.Object({
		resolved: t.Optional(t.Boolean()),
	}),
})

.post("/me/todos", async ({ body, user }) => {
	await db.create<Omit<ToDo, "id">>("ToDo", { title: body.title, owner: new StringRecordId(user.sub), due: null, done: false });
}, {
	body: tToDoPost,
	detail: {
		description: "Creates a todo for the currently logged in user.",
	}
})

.get("/me/pins", async ({ body, user }) => {
	const [pins] = await db.query<[{ id: StringRecordId }[]]>("SELECT out AS id FROM pins WHERE in = $id;", { id: new StringRecordId(user.sub) });

	return pins.map(p => ({ id: p.id.toString() }));
}, {
	response: t.Array(t.Object({
		id: t.String(),
	})),
	detail: {
		description: "Fetches all a pinned items for the currently logged in user.",
	}
})

.post("/me/pins", async ({ body, user }) => {
	const u = await db.select<User>(new StringRecordId(user.sub));

	if (u === undefined) {
		throw new NotFoundError("User not found.");
	}

	await db.query("RELATE $user->pins->$item;", { user: new StringRecordId(user.sub), item: new StringRecordId(body.id) });
}, {
	body: t.Object({
		id: t.String(),
	}),
	detail: {
		description: "Adds a pinned item for the currently logged in user. Does nothing if the pinned item already exists.",
	}
})

.delete("/me/pins/:id", async ({ body, user, params: { id } }) => {
	const u = await db.select<User>(new StringRecordId(user.sub));

	if (u === undefined) {
		throw new NotFoundError("User not found.");
	}

	await db.query("DELETE $user->pins WHERE out=$item RETURN BEFORE;", { user: new StringRecordId(user.sub), item: new StringRecordId(id) });
}, {
	detail: {
		description: "Creates a todo for the currently logged in user.",
	}
});

const map = ({ id, handle, full_name, email, color }: User) => ({
	id: id.toString(),
	handle, full_name, email,
	color,
});
