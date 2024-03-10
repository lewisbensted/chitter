import express, { Request, Response } from "express";

const router = express.Router();

router.delete("/", (req: Request, res: Response) => {
	req.session.destroy((error) => {
		if (error && error) {
			console.log("Error logging out:", error.message);
			res.status(500).send();
		} else {
			res.status(200).send("OK");
		}
	});
});

export default router;
