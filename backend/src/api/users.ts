import Surreal, { RecordId, StringRecordId } from "surrealdb";
import { Elysia, NotFoundError, t } from "elysia";
import { jwt } from '@elysiajs/jwt';

import { type User, type ToDo, type Colors } from "../db/types";
import { tUserPost, tUser, tToDo, tToDoPost, tColors, tUserId } from "./schemas";
import { map as mapToDo } from "./todos";

export const users = (db: Surreal) => new Elysia({ prefix: "/users", tags: ["Users"] })
.use(jwt({ name: 'jwt', secret: 'Fischl von Luftschloss Narfidort' }))
.resolve({ as: 'global' }, async ({ jwt, cookie: { auth } }) => {
	const token = await jwt.verify(auth.value);

	if (!token) {
		throw new Error("Invalid token.");
	}

	return { id: token.sub };
})

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

	const user = await db.create<Omit<User, "id">>("User", { email: body.email, full_name: body.full_name, handle, pinned: [], color: "Green/Light" });

	return { id: user[0].id.toString() };
}, {
	body: tUserPost,
	response: t.Object({ id: tUserId }),
	detail: {
		description: `Creates a user under the querying user's organization.
		If no handle is provided the user's handle will be set as the username of the email.
		This method will fail if the handle or email already exists.
		This method will fail if the email's domain is not allowed in the organization.`,
	}
})

.patch("/me", async ({ body }) => {
	let user: { color?: Colors } = {};

	if (body.color !== undefined) {
		user.color = body.color;
	}

	await db.merge<User>(new RecordId("User", "yt2hrlb0mynjar8q5la5"), user);
}, {
	body: t.Object({
		color: t.Optional(tColors),
	})
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

.get("/me/todos", async ({ query: { resolved } }) => {
	const results = await db.query<[ToDo[]]>("SELECT * FROM ToDo WHERE owner == $owner AND done == $resolved;", { owner: new StringRecordId("User:yt2hrlb0mynjar8q5la5"), resolved });

	const todos = results[0];

	return todos.map(mapToDo);
}, {
	response: t.Array(tToDo),
	query: t.Object({
		resolved: t.Optional(t.Boolean()),
	}),
})

.post("/me/todos", async ({ body }) => {
	await db.create<Omit<ToDo, "id">>("ToDo", { title: body.title, owner: new StringRecordId("User:yt2hrlb0mynjar8q5la5"), due: null, done: false });
}, {
	body: tToDoPost,
	detail: {
		description: "Creates a todo for the currently logged in user.",
	}
})

.get("/me/pins", async ({ body, id: uid }) => {
	const user = await db.select<User>(new StringRecordId(uid));

	return user.pinned.map(id => { id: id.toString() });
}, {
	response: t.Array(t.Object({
		id: t.String(),
	})),
	detail: {
		description: "Fetches all a pinned items for the currently logged in user.",
	}
})

.post("/me/pins", async ({ body, id: uid }) => {
	const user = await db.select<User>(new StringRecordId(uid));

	if (user === undefined) {
		throw new NotFoundError("User not found.");
	}

	const id = new StringRecordId(body.id);

	if (user.pinned.some(e => e.toString() == id.toString())) { return; }

	user.pinned.push(id);

	await db.merge<User>(new StringRecordId(uid), { pinned: user.pinned });
}, {
	body: t.Object({
		id: t.String(),
	}),
	detail: {
		description: "Adds a pinned item for the currently logged in user. Does nothing if the pinned item already exists.",
	}
})

.delete("/me/pins/:id", async ({ body, id: uid, params: { id } }) => {
	const user = await db.select<User>(new StringRecordId(uid));

	user.pinned = user.pinned.filter(upid => upid.toString() !== id);

	await db.merge<User>(new StringRecordId(uid), { pinned: user.pinned });
}, {
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
