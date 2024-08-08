import { Elysia } from "elysia";
import { tFeature } from "./schemas";

import { tRepository } from "./schemas";

export const repositories = new Elysia({ prefix: "/repositories", tags: ["Repositories"] });

repositories.post("", async () => {

}, { body: tRepository, detail: { description: "Creates a Git repository" } });