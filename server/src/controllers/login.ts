import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	const { username, password } = req.body;
	try {
		if (req.session.user?.id) {
			res.status(403).send("Already logged in");
		} else {
			const user = await prisma.user.findFirst({ where: { username: username } });
			if (user) {
				if (bcrypt.compareSync(password, user.password)) {
					req.session.user = { id: user.id, username: username };
					res.cookie("session_id", req.sessionID);
					res.cookie("user_id", req.session.user.id);
					res.status(200).send("OK");
				} else {
					res.status(401).send("Incorrect password");
				}
			} else {
				res.status(401).send("Username not found");
			}
		}
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
