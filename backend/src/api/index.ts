import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';

import type { Account, BugId, ChannelId, ComponentId, FeatureId, LabelId, ProductId, ProjectId, TeamId, User, UserId } from "../db/types";

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
import { docgen } from "./docgen";
import Surreal, { StringRecordId, surql } from "surrealdb";
import type { Events } from "../events";
import { tClasses } from "./schemas";

import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { user } from "../session";

const ES256 = -7;
const RS256 = -257;

export const server = (db: Surreal, event_queue: Events) => new Elysia({ prefix: "/api" })

.use(cors())

.get("/health", async () => {
	return { status: "ok" };
})

.get("/auth/passkeys/challenges", async ({ query, cookie: { auth }, }) => {
	const email = query.email;

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
		id: isoBase64URL.toBase64(passkey.id),
		type: 'public-key',
		transports: passkey.transports.map(t => t.type),
	}));

	try {
		const options = await generateRegistrationOptions({
			rpName: "Netter",
			rpID: "localhost",
			userID: isoBase64URL.toBuffer(user.id.toString()),
			userName: user.email,
			userDisplayName: user.full_name,
			timeout: 60000,
			attestationType: 'direct',
			excludeCredentials,
			authenticatorSelection: {
				residentKey: 'preferred',
			},
			supportedAlgorithmIDs: [ES256, RS256],
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
	response: t.Object({
		options: t.Object({
			challenge: t.String(),
			user: t.Object({
				id: t.String(),
				name: t.String(),
				displayName: t.String(),
			}),
			excludeCredentials: t.Array(t.Object({
				id: t.String(),
				type: t.String(),
				transports: t.Array(t.String()),
			})),
			pubKeyCredParams: t.Array(t.Object({
				type: t.String(),
				alg: t.Number(),
			})),
			rp: t.Object({
				name: t.String(),
				id: t.String(),
			}),
		}),
	}),
	query: t.Object({ email: t.String({ format: "email" }) }),
})

.get("/auth/passkeys", async ({ query }) => {
	const email = query.email;

	const [[user]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${email};`);

	if (user === undefined) {
		throw new Error("User not found.");
	}

	const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE user.id = ${user.id};`);

	if (account === undefined) {
		throw new Error("Account not found.");
	}

	const passkeys = account.passkeys;

	const options = await generateAuthenticationOptions({
		rpID: "localhost",
		timeout: 60000,
		userVerification: "discouraged",
		allowCredentials: passkeys.map(passkey => ({
			id: isoBase64URL.fromUTF8String(passkey.id),
			transports: passkey.transports.map(t => t.type),
		})),
	});

	return {
		challenge: options.challenge,
		passkeys: passkeys.map(passkey => ({
			id: passkey.id,
		})),
	};
}, {
	query: t.Object({ email: t.String({ format: "email" }) }),
	response: t.Object({
		challenge: t.String(),
		passkeys: t.Array(t.Object({
			id: t.String(),
		})),
	}),
})

.post("/auth/passkeys", async ({ body }) => {
	try {
		const verification = await verifyRegistrationResponse({
			response: body.credential,
			expectedChallenge: body.challenge,
			expectedOrigin: "http://localhost:5173", // TODO: Change this to the actual origin
			expectedRPID: "localhost",
			requireUserVerification: false,
		});
	
		if (!(verification.verified && verification.registrationInfo)) {
			throw new Error("Registration verification failed.");
		}

		const { credential: { publicKey, id, transports, counter } } = verification.registrationInfo;

		const [[user]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${"fvilla@netnix.net"};`);
		const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE user.id = ${user.id};`);

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
		challenge: t.String(),
		credential: t.Object({
			id: t.String(),
			rawId: t.String(),
			response: t.Object({
				clientDataJSON: t.String(),
				attestationObject: t.String(),
				authenticatorData: t.Optional(t.String()),
				transports: t.Optional(t.Array(t.Union([t.Literal('ble'), t.Literal('cable'), t.Literal('hybrid'), t.Literal('internal'), t.Literal('nfc'), t.Literal('smart-card'), t.Literal('usb')]))),
				publicKeyAlgorithm: t.Optional(t.Number(),),
				publicKey: t.Optional(t.String()),
			}),
			authenticatorAttachment: t.Optional(t.Union([t.Literal("cross-platform"), t.Literal("platform")])),
			clientExtensionResults: t.Object({
				appid: t.Optional(t.Boolean()),
				credProps: t.Optional(t.Object({
					rk: t.Optional(t.Boolean()),
				})),
				hmacCreateSecret: t.Optional(t.Boolean()),
			}),
			type: t.Literal("public-key"),
		}),
	}),
})

.post("/auth/token", async ({ body, jwt, cookie: { auth } }) => {
	let user;

	if (body.test) {
		const [[u]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${body.test};`);
		
		if (u === undefined) {
			throw new Error("User not found.");
		}

		user = u;
	}

	if (body.passkey) {
		try {
			const passkey_id = isoBase64URL.toUTF8String(body.passkey.response.id);

			// Select account with a passkey matching the provided id
			const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE passkeys[WHERE id = ${passkey_id}];`);

			if (account === undefined) {
				throw new Error("No account found for the given passkey.");
			}

			const passkey = account.passkeys.find(p => p.id === passkey_id);

			if (!passkey) {
				throw new Error("No passkey found for the given account.");
			}

			const { verified, authenticationInfo } = await verifyAuthenticationResponse({
				expectedChallenge: isoBase64URL.fromUTF8String(body.passkey.challenge),
				response: body.passkey.response,
				expectedOrigin: "http://localhost:5173", // TODO: Change this to the actual origin
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

			const [[u]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE id = ${account.user.id};`);
		
			if (u === undefined) {
				throw new Error("User not found.");
			}

			user = u;
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

		const [[u]] = await db.query<[User[]]>(surql`SELECT * FROM User WHERE email = ${email};`);

		if (u === undefined) {
			throw new Error("User not found.");
		}
		
		const [[account]] = await db.query<[Account[]]>(surql`SELECT * FROM Account WHERE user.id = ${u.id};`);
		
		if (account === undefined) {
			throw new Error("Account not found.");
		}

		user = u;
	}

	if (!user) {
		throw new Error("No user found.");
	}

	const value = await jwt.sign({
		sub: user.id.toString(),
	});

	auth.set({
		value,
		maxAge: 60 * 60 * 24 * 7,
		priority: 'high',
	});

	return { token: value };
}, {
	detail: {
		description: "Authenticate a user using a passkey or a provider. If a passkey is provided, the user will be authenticated using WebAuthn. If a provider is provided, the user will be authenticated using OAuth.",
	},
	cookie: t.Cookie({
		auth: t.Optional(t.String()),
	}, {
		httpOnly: true,
		sameSite: "strict",
		secrets: "Fischl von Luftschloss Narfidort",
		secure: true,
		sign: ['auth'],
	}),
	body: t.Object({
		passkey: t.Optional(t.Object({
			challenge: t.String(),
			response: t.Object({
				id: t.String(),
				rawId: t.String(),
				response: t.Object({
					clientDataJSON: t.String(),
					attestationObject: t.String(),
					authenticatorData: t.Optional(t.String()),
					transports: t.Optional(t.Array(t.String())),
					publicKeyAlgorithm: t.Optional(t.Number(),),
					publicKey: t.Optional(t.String()),
					signature: t.String(),
				}),
				authenticatorAttachment: t.Optional(t.String()),
				clientExtensionResults: t.Optional(t.Object({
					appid: t.Optional(t.Boolean()),
					credProps: t.Optional(t.Object({
						rk: t.Optional(t.Boolean()),
					})),
					hmacCreateSecret: t.Optional(t.Boolean()),
				})),
				type: t.String(),
			}),
		}),),
		provider: t.Optional(
			t.Object({
				github: t.Optional(t.Object({
					token: t.String(),
				})),
			}),
		),
		test: t.Optional(t.String()),
	}),
})

.use(user)

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

.get("", async ({ query: { text, class: clss, exclude, suggest } }) => {
	const results = await db.query<[{ id: UserId, title: string }[], { id: ProjectId, title: string }[], { id: TeamId, title: string }[], { id: LabelId, title: string }[], { id: BugId, title: string }[], { id: ChannelId, title: string }[], { id: ProductId, title: string }[], { id: FeatureId, title: string }[], { id: ComponentId, name: string }[]]>(
		`SELECT id, full_name as title FROM User ${suggest == "User" ? "LIMIT 5" : "WHERE full_name @@ $text"};
		SELECT id, name as title FROM Project WHERE name @@ $text;
		SELECT id, name as title FROM Team WHERE name @@ $text;
		SELECT id, title FROM Task ${suggest == "Task" ? "LIMIT 5" : "WHERE title @@ $text"};
		SELECT id, title FROM Bug WHERE title @@ $text || description @@ $text;
		SELECT id, name as title FROM Channel WHERE name @@ $text AND target IS NULL;
		SELECT id, name as title FROM Product WHERE name @@ $text;
		SELECT id, name as title FROM Feature WHERE name @@ $text;
		SELECT id, name as title FROM Component WHERE name @@ $text;`,
		{ text, suggest }
	);

	let ids = results.flat().map(({ id, title }) => ({ id: id.toString(), title }));

	if (clss) {
		ids = ids.filter(({ id }) => id.startsWith(clss));
	}

	if (exclude) {
		ids = ids.filter(({ id }) => !exclude.includes(id));
	}

	return ids.map(({ id, title }) => ({
		id,
		title,
		class: id.split(":")[0],
	}));
}, {
	response: t.Array(t.Object({
		id: t.String(),
		title: t.String(),
		class: t.String(),
	})),
	query: t.Object({
		text: t.Optional(t.String({ maxLength: 128 })),
		class: t.Optional(tClasses),
		suggest: t.Optional(t.Union([tClasses])),
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

	if (!metadata) {
		throw new Error("Metadata not found.");
	}

	return {
		id: metadata.id.toString(),
		title: metadata.title || metadata.name || metadata.full_name,
	};
}, {
	params: t.Object({ id: t.String() }),
	response: t.Object({ id: t.String(), title: t.String() }),
})

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
.use(extensions(db))
.use(docgen(db))

.use(swagger({ path: "/docs", version: "0.0.1", documentation: { info: { title: "Netter API", version: "0.0.1", description: "Documentation for the Netter REST API" } } }))
;

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
