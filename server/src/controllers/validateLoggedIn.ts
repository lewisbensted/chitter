import express, { Request, Response } from "express";
import { validateCredentials } from "../middleware/validateCredentials.js";

const router = express.Router();

router.get("/", validateCredentials, (req: Request, res: Response) => {
	res.status(200).send(req.session.user!.id);
});

export default router;
