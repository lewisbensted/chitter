import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const logErrors = (error: unknown) => {
	return (
		"" +
		(error instanceof Error ? error.message.replace(/\n\n/g, "\n") : "An unknown error has occured.") +
		((error instanceof PrismaClientInitializationError && error.errorCode == "P1003") ||
		(error instanceof PrismaClientKnownRequestError && error.code == "P2021")
			? "\nHave all migrations been executed successfully?"
			: "")
	);
};
