import { logError } from "./utils/logError.js";
import { createPrismaClient } from "../prisma/prismaClient.js";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library.js";
import { createApp } from "./app.js";
import { SERVER_PORT } from "../../config.js";

try {
	const prisma = createPrismaClient();
	await prisma.$connect();

	const app = createApp(prisma);

	app.listen(SERVER_PORT, () => {
		console.log(`\nServer running on port ${SERVER_PORT}.\n`);
	}).on("error", (error) => {
		logError(error);
	});
} catch (error) {
	console.error(
		error instanceof PrismaClientInitializationError ? "\nError initialising database connection:\n" : ""
	);
	logError(error);
}
