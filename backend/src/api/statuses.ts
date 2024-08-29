import { Elysia, t } from "elysia";
import { tLabel, tLabelPost, tStatus, tStatusId, tStatusPost } from "./schemas";
import type { Label, Status } from "../db/types";
import Surreal, { StringRecordId, surql } from "surrealdb";

export const statuses = (db: Surreal) => new Elysia({ prefix: "/statuses", tags: ["Statuses"] })
.get("", async () => {
	const results = await db.query<[Status[]]>(surql`SELECT * FROM Status ORDER BY position.i ASC;`);
	const statuses = results[0];
	return statuses.map(map);
}, {
	response: t.Array(tStatus),
})
.post("", async ({ body }) => {
	const statuses = await db.create<Omit<Status, "id">>("Status", { name: body.name, state: body.state, color: "Green/Light", icon: ':' });

	const status = statuses[0];

	return { id: status.id.toString() };
}, {
	body: tStatusPost,
	response: t.Object({ id: tStatusId }),
});

const map = ({ id, name, state }: Status) => {
    return {
        id: id.toString(),
        name, state,
    };
};
