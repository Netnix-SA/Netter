import { RecordId, StringRecordId, Surreal } from "surrealdb";
import { Elysia, NotFoundError, t } from "elysia";

import { type Task, type Project, type ProjectId, type Team, type TeamId, type User, type UserId, type LabelId, type View, type Label } from "@/server/db/types";
import { tUserPost, tUser } from "./schemas";
import { db } from "@/server/db";

export const users = new Elysia({ prefix: "/users", tags: ["Users"] })

.get("", async () => {
	const users = await db.select<User>("User");

	return users.map(user => ({
		id: user.id.toString(),
		email: user.email,
		handle: user.handle,
		full_name: user.full_name,
	}))
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
		handle = body.email.split('@')[0];
	}

	// TODO: check email address against organization's whitelist

	let rows = await db.query<[User[]]>("SELECT * FROM User WHERE email = $email OR handle = $handle;", { email: body.email, handle: body.handle });

	if (rows[0].length > 0) {
		throw new NotFoundError("A user with this handle or email already exists.");
	}

	await db.create<User>("User", { email: body.email, full_name: body.full_name, handle });
}, {
	body: tUserPost,
	detail: {
		description: `Creates a user under the querying user's organization.
		If no handle is provided the user's handle will be set as the username of the email.
		This method will fail if the handle or email already exists.
		This method will fail if the email's domain is not allowed in the organization.`,
	}
});