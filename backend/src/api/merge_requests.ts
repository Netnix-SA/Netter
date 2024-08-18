import { Elysia } from "elysia";
import { tFeature, tMergeRequest } from "./schemas";

export const merge_requests = new Elysia({ prefix: "/merge-requests", tags: ["Merge Requests"] });

merge_requests.post("", async () => {

}, { body: tMergeRequest, detail: { description: "Creates a code Merge Request" } });