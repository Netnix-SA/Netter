import { Elysia, t } from "elysia";
import { tLabel, tLabelPost, tStatus } from "./schemas";
import type { Label, Status } from "../db/types";
import { db } from "../db/index";
import { surql } from "surrealdb";

export const statuses = new Elysia({ prefix: "/statuses", tags: ["Statuses"] })
.get("", async () => {
    const results = await db.query<[Status[]]>(surql`SELECT * FROM Status ORDER BY position.i;`);
    const statuses = results[0];
    return statuses.map(map);
}, {
    response: t.Array(tStatus),
})

const map = ({ id, name, state }: Status) => {
    return {
        id: id.toString(),
        name, state,
    };
};