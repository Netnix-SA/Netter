import { jwt } from '@elysiajs/jwt';
import Elysia from 'elysia';

export const user = new Elysia().use(jwt({ name: 'jwt', secret: 'Fischl von Luftschloss Narfidort' })).derive({ as: "scoped" }, async ({ jwt, cookie: { auth } }) => {
	if (!auth || !auth.value) {
		throw new Error('No JWT token found');
	}

	const user = await jwt.verify(auth.value);

	if (!user) {
		console.error("Cookie: ", auth.value);
		throw new Error('Invalid JWT token');
	}

	return { user };
});
