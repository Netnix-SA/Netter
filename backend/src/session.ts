import { jwt } from '@elysiajs/jwt';
import Elysia from 'elysia';

export const user = new Elysia().use(jwt({ name: 'jwt', secret: 'Fischl von Luftschloss Narfidort' })).derive({ as: "scoped" }, async ({ jwt, cookie: { auth } }) => {
	if (!jwt) {
		throw new Error('No JWT token found');
	}

	const user = await jwt.verify(auth.value);

	if (!user) {
		throw new Error('Invalid JWT token');
	}

	return { user };
});
