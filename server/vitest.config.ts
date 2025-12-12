import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include:
			process.env.TEST_TYPE === "unit"
				? ["tests/unit/**/*.test.ts"]
				: process.env.TEST_TYPE === "integration"
					? ["tests/integration/**/*.test.ts"]
					: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
		poolOptions: {
			threads: {
				singleThread: process.env.TEST_TYPE === "integration" ? true : false,
			},
		},
	},
});
