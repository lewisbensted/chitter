import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: Number(req.params.userId) } });
		user ? res.status(200).send(user.username) : res.status(404).send("User not found");
	} catch (error: unknown) {
		console.error(
			error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
				? "Error retrieving user from the database. Have all migrations been executed successfully?" +
						error.message.replace(/\n\n/g, " ")
				: "An unknown error has occured."
		);
		res.status(500).send();
	}
});

export default router;
