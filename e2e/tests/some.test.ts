import { test, expect } from "@playwright/test";

test.beforeAll(async () => {
	console.log("Starting the application...");
});

test("login", async ({ page }) => {
	console.log("Logging in...");

	await page.goto("http://localhost:5173/login");
	await page.fill('input[name="email"]', "fvilla@netnix.net");
	await page.getByRole("button", { name: "Test Login" }).click();
	await page.waitForURL("http://localhost:5173");
});

test.afterAll(async () => {
	console.log("Stopping the application...");
});