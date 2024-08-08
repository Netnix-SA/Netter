import type { User } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    return {
        users: fetch("/api/users", { method: "GET" }).then(e => e.json()),
    } as {
        users: Promise<User[]>,
    }
};