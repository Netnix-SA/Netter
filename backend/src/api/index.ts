import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';

import type { Account, BugId, ChannelId, FeatureId, LabelId, ProductId, ProjectId, TeamId, User, UserId } from "../db/types";

import { users } from "./users";
import { teams } from "./teams";
import { labels } from "./labels";
import { bugs } from "./bugs";
import { tasks } from "./tasks";
import { projects } from "./projects";
import { features } from "./features";
import { components } from "./components";
import { views } from "./views";
import { todos } from "./todos";
import { channels } from "./channels";
import { repositories } from "./repositories";
import { merge_requests } from "./merge_requests";
import { extensions } from "./extensions";
import { products } from "./products";
import { statuses } from "./statuses";
import { messages } from "./messages";
import { objectives } from "./objectives";
import Surreal, { StringRecordId, surql } from "surrealdb";
import type { Events } from "../events";
import { tClasses } from "./schemas";

import type { RegistrationResponseJSON } from "@simplewebauthn/types";
import { isoBase64URL } from '@simplewebauthn/server/helpers';

export const server = (db: Surreal, event_queue: Events) => new Elysia({ prefix: "/api" })

.use(cors())
.use(swagger({ path: "/docs", version: "0.0.1", documentation: { info: { title: "Netter API", version: "0.0.1", description: "Documentation for the Netter REST API" } } }))
.use(jwt({ name: 'jwt', secret: 'Fischl von Luftschloss Narfidort' }))

.get("/auth/passkeys", async ({ body, jwt, cookie: { auth }, }) => {
	const email = body.email;

	const [[user]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${email};`);

	if (user === undefined) {
		throw new Error("User not found.");
	}

	const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE user.id = ${user.id};`);

	if (account === undefined) {
		throw new Error("Account not found.");
	}

	const passkeys = account.passkeys;

	const excludeCredentials = passkeys.map((passkey) => ({
		id: isoBase64URL.toBuffer(passkey.id),
		type: 'public-key',
		transports: passkey.transports.map(t => t.type),
	}));

	try {
		const options = await generateRegistrationOptions({
			rpName: "Netter",
			rpID: "localhost",
			userID: Buffer.from(user.id.toString()),
			userName: user.handle,
			timeout: 60000,
			attestationType: 'direct',
			excludeCredentials,
			authenticatorSelection: {
				residentKey: 'preferred',
			},
			// [ES256, RS256]
			supportedAlgorithmIDs: [-7, -257],
		});

		// set.cookie["challenge"] = options.challenge;

		return {
			options,
		};
	} catch (error) {
		console.error(error);
		return;
	}
}, {
	detail: {
		description: "Generate a passkey request for a user.",
	},
	response: t.Object({ options: t.Object({ challenge: t.String() }) }),
	body: t.Object({ email: t.String({ format: "email" }) }),
})

.post("/auth/passkeys", async ({ body, jwt, cookie: { auth } }) => {
	// Select account with a passkey matching the provided id
	const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE passkeys.id = ${body.passkey};`);

	if (account === undefined) {
		throw new Error("No account found for the given passkey.");
	}

	const [[user]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE id = ${account.user.id};`);

	if (user === undefined) {
		throw new Error("User not found.");
	}

	try {
		const verification = await verifyRegistrationResponse({
			response: body.passkey.registration_response as RegistrationResponseJSON,
			expectedChallenge: body.passkey.challenge,
			expectedOrigin: origin,
			expectedRPID: "localhost",
			requireUserVerification: true,
		});
	
		if (!(verification.verified && verification.registrationInfo)) {
			throw new Error("Registration verification failed.");
		}

		const { credential: { publicKey, id, transports, counter } } = verification.registrationInfo;

		account.passkeys.push({
			id: isoBase64URL.toUTF8String(id),
			public_key: isoBase64URL.fromBuffer(publicKey),
			transports: transports?.map(t => ({ type: t })) ?? [],
			counter,
		});

		await db.update<Account>(account.id, account);

		return;
	} catch (error) {
		console.error(error);
		return;
	}
}, {
	detail: {
		description: "Register a new passkey for a user.",
	},
	body: t.Object({
		passkey: t.Object({
			challenge: t.String(),
			registration_response: t.Any(),
		}),
	}),
})

.post("/auth/token", async ({ body, jwt, cookie: { auth } }) => {
	if (body.passkey) {
		// Select account with a passkey matching the provided id
		const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE passkeys.id = ${body.passkey};`);

		if (account === undefined) {
			throw new Error("No account found for the given passkey.");
		}

		const [[user]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE id = ${account.user.id};`);
	
		if (user === undefined) {
			throw new Error("User not found.");
		}

		try {
			const passkey = account.passkeys[0];

			if (!passkey) {
				throw new Error("No passkey found for the given account.");
			}

			const { verified, authenticationInfo } = await verifyAuthenticationResponse({
				expectedChallenge: body.passkey.challenge,
				response: body.passkey.response,
				expectedOrigin: "localhost", // TODO: Change this to the actual origin
				expectedRPID: "localhost",
				credential: {
					id: passkey.id,
					publicKey: isoBase64URL.toBuffer(passkey.public_key),
					transports: passkey.transports.map(t => t.type),
					counter: passkey.counter,
				},
				requireUserVerification: false,
			});

			if (!verified) {
				throw new Error("Authentication verification failed.");
			}

			const value = await jwt.sign({
				sub: user.email,
			});
	
			auth.set({
				value,
				httpOnly: true,
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 7,
			});
	
			return { token: value };
		} catch (error) {
			console.error(error);
			return;
		}
	}

	if (body.provider && body.provider.github) {
		const gh_token = await jwt.verify(body.provider.github.token);
		if (!gh_token) {
			throw new Error("Invalid GitHub token.");
		}

		const email = gh_token.sub;

		const [[user]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${email};`);

		if (user === undefined) {
			throw new Error("User not found.");
		}
		
		const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE user.id = ${user.id};`);
		
		if (account === undefined) {
			throw new Error("Account not found.");
		}
		
		const value = await jwt.sign({
			sub: user.email,
		});

		auth.set({
			value,
			httpOnly: true,
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7,
		});

		return { token: value };
	}

	throw new Error("No valid authentication method provided.");
}, {
	detail: {
		description: "Authenticate a user using a passkey or a provider. If a passkey is provided, the user will be authenticated using WebAuthn. If a provider is provided, the user will be authenticated using OAuth.",
	},
	body: t.Object({
		passkey: t.Optional(t.Object({
			challenge: t.String(),
			response: t.Any(),
		}),),
		provider: t.Optional(
			t.Object({
				github: t.Optional(t.Object({
					token: t.String(),
				})),
			}),
		),
	}),
})

.ws("/ws", {
	open(ws) {
		console.log(ws.remoteAddress, "started a live connecion to Netter.");
		ws.subscribe("EVENT:Connection");
		ws.publish("EVENT:Connection", { message: "Connected to Netter." });
	},
	message(ws, message) {

		console.log(message);
	},
})

.get("", async ({ query: { text, class: clss, exclude } }) => {
	const results = await db.query<[{ id: UserId, title: string }[], { id: ProjectId, title: string }[], { id: TeamId, title: string }[], { id: LabelId, title: string }[], { id: BugId, title: string }[], { id: ChannelId, title: string }[], { id: ProductId, title: string }[], { id: FeatureId, title: string }[]]>("SELECT id, full_name as title FROM User WHERE full_name @@ $text; SELECT id, name as title FROM Project WHERE name @@ $text; SELECT id, name as title FROM Team WHERE name @@ $text; SELECT id, title FROM Task WHERE title @@ $text; SELECT id, title FROM Bug WHERE title @@ $text || description @@ $text; SELECT id, name as title FROM Channel WHERE name @@ $text; SELECT id, name as title FROM Product WHERE name @@ $text; SELECT id, name as title FROM Feature WHERE name @@ $text;", { text });

	let ids = results.flat().map(({ id, title }) => ({ id: id.toString(), title }));

	if (clss) {
		ids = ids.filter(({ id }) => id.startsWith(clss));
	}

	if (exclude) {
		ids = ids.filter(({ id }) => !exclude.includes(id));
	}

	return ids.map(({ id, title }) => ({ id, title }));
}, {
	response: t.Array(t.Object({ id: t.String(), title: t.String() })),
	query: t.Object({
		text: t.Optional(t.String({ maxLength: 128 })),
		class: t.Optional(tClasses),
		exclude: t.Optional(t.Array(t.String())),
	}),
	detail: {
		description: "Allows searching across the querying user's whole organization",
	},
})

.get("/metadata/:id", async ({ params: { id } }) => {
	const table = id.split(":")[0];
	const oid = id.split(":")[1];

	const results = await db.query<[any[]]>(`SELECT id, name, title, full_name FROM ${table} WHERE id = $id;`, { id: new StringRecordId(id) });

	const metadata = results[0][0];

	return {
		id: metadata.id.toString(),
		title: metadata.title || metadata.name || metadata.full_name,
	};
}, {
	params: t.Object({ id: t.String() }),
	response: t.Object({ id: t.String(), title: t.String() }),
})

// .resolve({ as: 'global' }, async ({ jwt, cookie: { auth } }) => {
// 	const token = await jwt.verify(auth.value);

// 	if (!token) {
// 		throw new Error("Invalid token.");
// 	}

// 	return { id: token.sub };
// })
.use(users(db))
.use(teams(db))
.use(channels(db, event_queue))
.use(messages(db, event_queue))
.use(projects(db, event_queue))
.use(bugs(db, event_queue))
.use(features(db))
.use(components(db))
.use(products(db))
.use(labels(db))
.use(statuses(db))
.use(tasks(db, event_queue))
.use(todos(db))
.use(views(db))
.use(objectives(db))
.use(repositories(db))
.use(merge_requests(db))
.use(extensions(db));

// The uuid of the live query will be returned
// const queryUuid = await db.live(
// 	"Message",
// 	// The callback function takes two arguments: the 'action' and 'result' properties
// 	(action, result) => {
// 		// action can be: 'CREATE', 'UPDATE', 'DELETE' or 'CLOSE'
// 	    if (action === 'CREATE') {
// 			server.server?.publish("EVENT:Message", JSON.stringify(result));
// 		}
// 	}
// )

export type App = ReturnType<typeof server>;
