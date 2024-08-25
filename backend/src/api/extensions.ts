import { Elysia } from "elysia";
import { tApplication, tFeature, tGithubOrganizationIntegration, tKimaiOrganizationIntegration } from "./schemas";
import type Surreal from "surrealdb";

export const extensions = (db: Surreal) => new Elysia({ prefix: "/extensions", tags: ["Extensions"] })

.post("/github", () => {

}, { body: tGithubOrganizationIntegration })

.post("/kimai", () => {

}, { body: tKimaiOrganizationIntegration });
