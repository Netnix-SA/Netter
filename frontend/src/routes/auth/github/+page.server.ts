import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { App } from "octokit";

export const load: PageServerLoad = async ({ url }) => {
    if (url.searchParams.get("error")) {
        throw error(400, url.searchParams.get("error") || "GitHub reported an unknown error.");
    }

    const app = new App({
        appId: parseInt(process.env.GITHUB_APP_ID || "UNDEFINED"),
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY || "UNDEFINED",
        oauth: {
            clientId: process.env.GITHUB_APP_CLIENT_ID || "UNDEFINED",
            clientSecret: process.env.GITHUB_APP_CLIENT_SECRET || "UNDEFINED",
        }
    });

    const response = await app.oauth.createToken({ code: url.searchParams.get("code") || "INVALID_CODE" });

    // TODO: lookup the user

    throw redirect(301, "/");
};