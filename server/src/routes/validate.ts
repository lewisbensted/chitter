import express, { Request, Response } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { logError } from "../utils/logError.js";

const router = express.Router();

router.get("/", authenticate, (req: Request, res: Response) => {
	try {
		res.status(200).send(req.session.user);
	} catch (error) {
		console.error("Error authenticating user:\n" + logError(error));
		res.status(500).send("An unexpected error occured.");
	}
});

export default router;
