import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { checkUser } from "../utils/checkUser.js";

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = await checkUser(req.params.userId);
        res.status(200).send({ user: user });
    } catch (error) {
        console.error("Error retrieving user from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
