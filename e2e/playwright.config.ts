import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "tests",
	workers: 1,
	use: {
		headless: false,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});