import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { logErrors } from "../utils/logErrors.js";
import prisma from "../prismaClient.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	const { username, password } = req.body;
	try {
		if (req.session.user?.id) {
			res.status(403).send(["Already logged in"]);
		} else {
			const user = await prisma.user.findUnique({ where: { username: username } });
			if (user) {
				if (bcrypt.compareSync(password, user.password)) {
					req.session.user = { id: user.id, username: username };
					res.cookie("session_id", req.sessionID);
					res.cookie("user_id", req.session.user.id);
					res.status(200).send(user);
				} else {
					res.status(401).send(["Incorrect password"]);
				}
			} else {
				res.status(404).send(["User not found"]);
			}
		}
	} catch (error) {
		console.error("Error loggin in:\n" + logErrors(error));
		res.status(500).send();
	}
});

export default router;
