import express, { Request, Response } from "express";
import { validateCredentials } from "../middleware/validateCredentials.js";
import { logErrors } from "../utils/logErrors.js";

const router = express.Router();

router.get("/", validateCredentials, (req: Request, res: Response) => {
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
