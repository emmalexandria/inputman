import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					include: ["tests/**/*.test.ts"],
					exclude: ["tests/**/*.browser.test.ts"],
					name: "code",
					environment: "happy-dom",
				},
			},
			{
				test: {
					include: ["tests/**/*.browser.test.ts"],
					browser: {
						headless: true,
						provider: "playwright",
						enabled: true,
						screenshotFailures: false,
						instances: [
							{ browser: "chromium" },
						],
					},
					name: "browser",
				},
			},
		],
	},
});
