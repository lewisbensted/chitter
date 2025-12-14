import { defineConfig } from "vitest/config";
import { TEST_TYPE } from "../config.js";

export default defineConfig({
	test: {
		include:
			TEST_TYPE === "unit"
				? ["tests/unit/**/*.test.ts"]
				: TEST_TYPE === "integration"
					? ["tests/integration/**/*.test.ts"]
					: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
		poolOptions: {
			threads: {
				singleThread: TEST_TYPE === "integration" ? true : false,
			},
		},
	},
});
