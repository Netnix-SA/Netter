import { Elysia } from "elysia";
import { tApplication, tFeature, tGithubOrganizationIntegration, tKimaiOrganizationIntegration } from "./schemas";

export const extensions = new Elysia({ prefix: "/extensions", tags: ["Extensions"] });

extensions.post("/github", () => {

}, { body: tGithubOrganizationIntegration });

extensions.post("/kimai", () => {

}, { body: tKimaiOrganizationIntegration });