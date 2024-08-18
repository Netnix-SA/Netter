import { Elysia, t } from "elysia";
import { tFeature, tRepositoryId } from "./schemas";
import { App } from "octokit";
import { tRepository } from "./schemas";
import { db } from "../db/index";
import type { Organization, Repository } from "../db/types";
import { StringRecordId } from "surrealdb";

export const repositories = new Elysia({ prefix: "/repositories", tags: ["Repositories"] })

.post("", async () => {

}, { body: tRepository, detail: { description: "Creates a Git repository" } })

.get("", async () => {
	const results = await db.query<[Repository[]]>("SELECT * FROM Repository;");

	const repositories = results[0];
	
	return repositories.map(map);
}, {
	response: t.Array(tRepository),
})

.get("/:id", async ({ params: { id } }) => {
	const repository = await db.select<Repository>(new StringRecordId(id));

	return map(repository);
}, {
	params: t.Object({ id: tRepositoryId }),
	response: tRepository,
})

.route("SYNC", "/:id", async ({ params: { id } }) => {
	console.log("Syncing repository", id);

	const repository = await db.select<Repository>(new StringRecordId(id));

	const app = new App({
		appId: parseInt(process.env.GITHUB_APP_ID || "UNDEFINED"),
		privateKey: process.env.GITHUB_APP_PRIVATE_KEY || "UNDEFINED",
	});

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

	{
		const owner = repository.url.split("/")[3];
		const repo = repository.url.split("/")[4];

		if (!owner || !repo) {
			throw new Error("Invalid repository url!");
		}

		const { data } = await inst.request('GET /repos/{owner}/{repo}/branches', { repo, owner, headers: {
			'X-GitHub-Api-Version': '2022-11-28'
		} });

		let branches = data.map(({ name }: { name: string }) => ({ name }));

		await db.merge<Repository>(new StringRecordId(id), { branches });
	}
}, {
	config: {
		allowMeta: true,
	},
	params: t.Object({ id: tRepositoryId }),
})

const map = ({ id, name, url, branches }: Repository) => {
	return {
		id: id.toString(),
		name, url,
		provider: (url.startsWith("https://github.com") ? "GitHub" : "GitHub") as "GitHub",
		branches,
	};
};