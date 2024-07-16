import { Request, Response, NextFunction } from "express";
import { authenticate } from "../utils/authenticate";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	if (authenticate(req)){
		next()
	} else{
		res.status(401).send("Invalid credentials.")
	}
};
