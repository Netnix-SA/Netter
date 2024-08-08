import { Elysia, t } from "elysia";
import { tApplication, tApplicationPost, tBug, tFeature } from "./schemas";
import { db } from "@/server/db";
import { type Application, type Bug } from "@/server/db/types";
import { StringRecordId, surql } from "surrealdb";

export const applications = new Elysia({ prefix: "/applications", tags: ["Applications"] });

applications.post("", async ({ body: { name } }) => {
    await db.create<Omit<Application, "id">>("Application", {
        name,
    });
}, {
    body: tApplicationPost,
    detail:
    {
        description: "Creates an application under the connected user's organization"
    }
});

applications.get("", async () => {
    const applications = await db.select<Application>("Application");

    return applications.map(({ id, name }) => ({
        id: id.toString(),
        name,
    }));
}, {
    response: t.Array(tApplication)
});

applications.get("/:id/bugs", async ({ params: { id } }) => {
	const application_id = new StringRecordId(id);

	const results = await db.query<[Bug[]]>(surql`SELECT * FROM Bug WHERE applications CONTAINS ${application_id};`);

	const bugs = results[0];

	return {
		bugs: bugs.map(({ id, title, description }) => ({
			id: id?.toString(),
			title, description,
		})),
	};
}, {
	response: t.Object({
		bugs: t.Array(tBug),
	}),
	detail: {
		description: "Returns the bugs the application currently has.",
	}
});

export const map = ({ id, name }: Application) => {
	return {
        id: id.toString(),
        name,
    };
}