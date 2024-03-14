import express, { Request, Response } from "express";
import { logErrors } from "../utils/logErrors.js";
import prisma from "../client.js";

const router = express.Router({ mergeParams: true });

router.post("/", async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: Number(req.params.userId) } });
		user ? res.status(200).send(user.username) : res.status(404).send("User not found");
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logErrors(error));
		res.status(500).send();
	}
});

export default router;
