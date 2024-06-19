import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";

const router = express.Router({ mergeParams: true });

router.post("/", async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: Number(req.params.userId) },
		});
		user
			? res.status(200).send(user.username)
			: res.status(404).send("User not found");
	} catch (error) {
		console.error(
			"Error retrieving user from the database:\n" + logError(error)
		);
		res.status(500).send("An unexpected error occured.");
	}
});

export default router;
