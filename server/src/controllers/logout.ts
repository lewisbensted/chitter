import express, { Request, Response } from "express";

const router = express.Router();

router.delete("/", (req: Request, res: Response) => {
	req.session.destroy((error: unknown) => {
		if (error) {
			console.error("Error logging out:\n" + (error instanceof Error ? `${error.message}` : "An unknown error has occured."));
			res.status(500).send();
		} else {
			res.status(200).send("OK");
		}
	});
});

export default router;
