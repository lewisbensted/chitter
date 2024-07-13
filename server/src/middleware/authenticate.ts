import { Request, Response, NextFunction } from "express";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
	if (req.session.user?.id && req.sessionID == req.cookies.session_id && req.session.user.id == req.cookies.user_id) {
		next();
	} else {
		res.status(401).send("Invalid credentials.");
	}
};

