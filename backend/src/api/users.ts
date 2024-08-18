import { StringRecordId } from "surrealdb";
import { Elysia, NotFoundError, t } from "elysia";

import { type User, type ToDo } from "../db/types";
import { tUserPost, tUser, tToDo, tToDoPost } from "./schemas";
import { db } from "../db/index";
import { map as mapToDo } from "./todos";

export const users = new Elysia({ prefix: "/users", tags: ["Users"] })

.get("", async () => {
	const users = await db.select<User>("User");

	return users.map(map)
}, {
	response: t.Array(tUser),
	detail: {
		description: "Returns all users that belong to the querying user's organization.",
	}
})

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

	await db.create<Omit<User, "id">>("User", { email: body.email, full_name: body.full_name, handle, pinned: [] });
}, {
	body: tUserPost,
	detail: {
		description: `Creates a user under the querying user's organization.
		If no handle is provided the user's handle will be set as the username of the email.
		This method will fail if the handle or email already exists.
		This method will fail if the email's domain is not allowed in the organization.`,
	}
})

.get("/me", async ({}) => {
	const results = await db.query<[User[]]>("SELECT * FROM User WHERE id == $id;", { id: new StringRecordId("User:yt2hrlb0mynjar8q5la5") });

	const user = results[0][0];

	if (!user) {
		throw new NotFoundError("User not found.");
	}

	return map(user);
}, {
	response: tUser,
	detail: {
		description: "Returns the user that is currently logged in.",
	}
})

.get("/me/todos", async ({}) => {
	const results = await db.query<[ToDo[]]>("SELECT * FROM ToDo WHERE owner == $owner;", { owner: new StringRecordId("User:yt2hrlb0mynjar8q5la5") });

	const todos = results[0];

	return todos.map(mapToDo);
}, {
	response: t.Array(tToDo),
})

.post("/me/todos", async ({ body }) => {
	await db.create<Omit<ToDo, "id">>("ToDo", { title: body.title, url: body.url, owner: new StringRecordId("User:yt2hrlb0mynjar8q5la5"), due: null, done: false });
}, {
	body: tToDoPost,
	detail: {
		description: "Creates a todo for the currently logged in user.",
	}
})

.post("/me/pins", async ({ body }) => {
	const user = await db.select<User>(new StringRecordId("User:yt2hrlb0mynjar8q5la5"));

	user.pinned.push(new StringRecordId(body.id));

	await db.merge<User>(new StringRecordId("User:yt2hrlb0mynjar8q5la5"), { pinned: user.pinned });
}, {
	body: t.Object({
		id: t.String(),
	}),
	detail: {
		description: "Creates a todo for the currently logged in user.",
	}
})

.delete("/me/pins", async ({ body }) => {
	const user = await db.select<User>(new StringRecordId("User:yt2hrlb0mynjar8q5la5"));

	user.pinned = user.pinned.filter(id => id.toString() !== body.id);

	await db.merge<User>(new StringRecordId("User:yt2hrlb0mynjar8q5la5"), { pinned: user.pinned });
}, {
	body: t.Object({
		id: t.String(),
	}),
	detail: {
		description: "Creates a todo for the currently logged in user.",
	}
});

const map = ({ id, handle, full_name, email, pinned, color }: User) => ({
	id: id.toString(),
	handle, full_name, email,
	pinned: pinned.map(id => id.toString()),
	color,
});