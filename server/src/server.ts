import { logError } from "./utils/logError.js";
import { createPrismaClient } from "../prisma/prismaClient.js";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library.js";
import { createApp } from "./app.js";
import { SERVER_PORT, validateConfig } from "../../config.js";

try {
	validateConfig();
	const prisma = createPrismaClient();
	await prisma.$connect();

	const app = createApp(prisma);

	app.listen(SERVER_PORT, () => {
		console.log(`\nServer running on port ${SERVER_PORT}.\n`);
	}).on("error", (error) => {
		logError(error);
		process.exit(1);
	});
	process.on("SIGINT", async () => {
		console.log("Caught SIGINT, shutting down...");
		await prisma.$disconnect();
		process.exit(0);
	});
} catch (error) {
	if (error instanceof PrismaClientInitializationError) {
		console.error("\nError initialising database connection:");
	} else if (error instanceof TypeError) {
		console.error("\nError initialising config variables:");
	} else {
		console.error("\nError starting server:");
	}
	logError(error);
	process.exit(1);
}
