import express, { Request, Response } from "express";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", authenticate, (req: Request, res: Response) => {
	try {
		res.status(200).send(req.session.user);
	} catch (error) {
		console.error(
			"Error validating user:\n" +
				(error instanceof Error ? error.message.replace(/\n\n/g, "\n") : "An unknown error has occured.")
		);
		res.status(500).send();
	}
});

export default router;
