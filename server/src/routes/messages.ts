import express, { Request, Response } from "express";

import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { Prisma } from "@prisma/client";
import { MessageSchema } from "../schemas/message.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

export const messageExtension = Prisma.defineExtension({
    query: {
        message: {
            async create({ args, query }) {
                args.data = await MessageSchema.parseAsync(args.data);
                return query(args);
            },
            async update({ args, query }) {
                args.data = await MessageSchema.parseAsync(args.data);
                return query(args);
            },
        },
    },
});

const checkRecipient = async (recipientId: string) => {
    if (isNaN(Number(recipientId))) {
        throw new TypeError("Invalid recipient ID provided - must be a number.");
    }
    const { username } = await prisma.user.findUniqueOrThrow({
        where: { id: Number(recipientId) },
    });
    return username;
};

export const fetchMessages = async (senderId: number, recipientId: number) => {
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: senderId, recipientId: recipientId },
                { senderId: recipientId, recipientId: senderId },
            ],
        },
    });
    messages.sort((messageA, messageB) => {
        return messageA.createdAt.valueOf() - messageB.createdAt.valueOf();
    });
    return messages;
};

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkRecipient(req.params.recipientId);
        const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
        res.status(200).send(messages);
    } catch (error) {
        console.error("Error retrieving messages from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const recipientUsername = await checkRecipient(req.params.recipientId);
        await prisma.$extends(messageExtension).message.create({
            data: {
                senderId: req.session.user!.id,
                senderUsername: req.session.user!.username,
                recipientId: Number(req.params.recipientId),
                recipientUsername: recipientUsername,
                text: req.body.text,
            },
        });
        const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
        res.status(201).send(messages);
    } catch (error) {
        console.error("Error adding message to the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.delete("/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkRecipient(req.params.recipientId);
        if (isNaN(Number(req.params.messageId))) {
            throw new TypeError("Invalid message ID provided - must be a number.");
        }
        const targetMessage = await prisma.message.findUniqueOrThrow({
            where: { id: Number(req.params.messageId) },
        });
        if (targetMessage.senderId === req.session.user!.id) {
            await prisma.message.delete({
                where: {
                    id: Number(req.params.messageId),
                },
            });
            const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
            res.status(200).send(messages);
        } else {
            res.status(403).send("Cannot delete someone else's message.");
        }
    } catch (error) {
        console.error("Error deleting cheet from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
