import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";

const router = express.Router();

router.delete("/", (req: Request, res: Response) => {
	if (req.session.user) {
		req.session.destroy((error: unknown) => {
			if (error) {
				console.error("Error logging out:\n" + logError(error));
				res.status(500).send("An unexpected error occured.");
			} else {
				res.status(200).send('Logout successful.');
			}
		});
	} else {
		res.status(403).send('Not logged in.')
	}
});

export default router;
