import { Elysia, t } from "elysia";
import { tApplication, tApplicationPost, tBug, tFeature } from "./schemas";
import { db } from "@/server/db";
import { type Application, type Bug } from "@/server/db/types";
import { StringRecordId, surql } from "surrealdb";
import { map as mapBug } from "./bugs";

export const applications = new Elysia({ prefix: "/applications", tags: ["Applications"] })

.post("", async ({ body: { name, description } }) => {
    await db.create<Omit<Application, "id">>("Application", {
        name, description,
    });
}, {
    body: tApplicationPost,
    detail:
    {
        description: "Creates an application under the connected user's organization"
    }
})

.get("", async () => {
    const applications = await db.select<Application>("Application");

    return applications.map(map);
}, {
    response: t.Array(tApplication)
})

.get("/:id", async ({ params: { id } }) => {
    const application = await db.select<Application>(new StringRecordId(id));

    return map(application);
}, {
    response: tApplication,
    detail: {
        description: "Returns the application with the given id."
    }
})

.get("/:id/bugs", async ({ params: { id } }) => {
	const application_id = new StringRecordId(id);

	const results = await db.query<[Bug[]]>(surql`SELECT * FROM Bug WHERE applications CONTAINS ${application_id};`);

	const bugs = results[0];

	return {
		bugs: bugs.map(mapBug),
	};
}, {
	response: t.Object({
		bugs: t.Array(tBug),
	}),
	detail: {
		description: "Returns the bugs the application currently has.",
	}
})

export const map = ({ id, name, description, repository }: Application) => {
	return {
        id: id.toString(),
        name, description,
        repository: repository ? { id: repository.toString() } : null,
    };
}