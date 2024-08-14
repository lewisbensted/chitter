import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

const fetchUser = async (userId: string) => {
    if (isNaN(Number(userId))) {
        throw new TypeError("Invalid user ID provided - must be a number.");
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: Number(userId) } });
};

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = await fetchUser(req.params.userId);
        res.status(200).send({ user: user });
    } catch (error) {
        console.error("Error retrieving user from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
