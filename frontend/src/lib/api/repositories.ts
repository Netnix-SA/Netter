import { Elysia, t } from "elysia";
import { tFeature } from "./schemas";
import { App } from "octokit";
import { tRepository } from "./schemas";
import { db } from "@/server/db";
import type { Organization, Repository } from "@/server/db/types";

export const repositories = new Elysia({ prefix: "/repositories", tags: ["Repositories"] })

repositories.post("", async () => {

}, { body: tRepository, detail: { description: "Creates a Git repository" } })

repositories.get("", async () => {
    const app = new App({
        appId: parseInt(process.env.GITHUB_APP_ID || "UNDEFINED"),
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY || "UNDEFINED",
    });

    // http://localhost/settings/integrations/github?code=<REDACTED>&installation_id=<REDACTED>&setup_action=install&success=true

    let installationId: number;

    {
        const results = await db.query<[Organization[]]>("SELECT * FROM Organization;");
        const organization = results[0][0];
        if (!organization) {
            throw new Error("Could not find organization!");
        }
        const github_integration = organization.integrations.find(({ type }) => type === "GitHub");
        if (!github_integration) {
            throw new Error("Could not find GitHub integration!");
        }
        if (github_integration.type === "GitHub") { // Redundant check, but typescript doesn't know that
            installationId = github_integration.installation_id;
        } else {
            throw new Error("Unknown integration type!");
        }
    }

    const inst = await app.getInstallationOctokit(installationId);

    const results = await db.query<[Repository[]]>("SELECT * FROM Repository;");
    
    const repositories = await Promise.all(results[0].map(async (repository) => {
        const owner = repository.url.split("/")[3];
        const repo = repository.url.split("/")[4];

        if (!owner || !repo) {
            throw new Error("Invalid repository url!");
        }

        const { data: branches } = await inst.request('GET /repos/{owner}/{repo}/branches', { repo, owner, headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        } });

        return { ...repository, branches: branches.map(({ name }: { name: string }) => name) };
    }));
    return repositories.map(map);
}, {
    response: t.Array(tRepository),
})

const map = ({ id, name, url, branches }: Repository & { branches: string[] }) => {
    return {
        id: id.toString(),
        name, url,
        provider: (url.startsWith("https://github.com") ? "GitHub" : "GitHub") as "GitHub",
        branches,
    };
};