import { Elysia } from "elysia";
import { tFeature, tMergeRequest } from "./schemas";
import type Surreal from "surrealdb";

export const merge_requests = (db: Surreal) => new Elysia({ prefix: "/merge-requests", tags: ["Merge Requests"] })

.post("", async () => {

}, { body: tMergeRequest, detail: { description: "Creates a code Merge Request" } });
