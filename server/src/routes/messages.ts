import express, { Request, Response } from "express";

import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { logError } from "../utils/logError.js";
import { Prisma } from "@prisma/client";
import { CreateMessageSchema, UpdateMessageSchema } from "../schemas/message.schema.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkUser } from "../utils/checkUser.js";

const router = express.Router({ mergeParams: true });

export const messageExtension = Prisma.defineExtension({
    query: {
        message: {
            async create({ args, query }) {
                args.data = await CreateMessageSchema.parseAsync(args.data);
                return query(args);
            },
            async update({ args, query }) {
                args.data = await UpdateMessageSchema.parseAsync(args.data);
                return query(args);
            },
        },
    },
});

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
        await checkUser(req.params.recipientId, "recipient");
        const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
        res.status(200).send(messages);
    } catch (error) {
        console.error("Error retrieving messages from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    const date = new Date();
    try {
        const recipientUser = await checkUser(req.params.recipientId, "recipient");
        await prisma.$extends(messageExtension).message.create({
            data: {
                senderId: req.session.user!.id,
                senderUsername: req.session.user!.username,
                recipientId: Number(req.params.recipientId),
                recipientUsername: recipientUser!.username,
                text: req.body.text,
                createdAt: date,
                updatedAt: date,
            },
        });
        const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
        res.status(201).send(messages);
    } catch (error) {
        console.error("Error adding message to the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.put("/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
    const date = new Date();
    try {
        await checkUser(req.params.recipientId, "recipient");
        if (isNaN(Number(req.params.messageId))) {
            throw new TypeError("Invalid message ID provided - must be a number.");
        }
        const targetMessage = await prisma.message.findUniqueOrThrow({
            where: { id: Number(req.params.messageId) },
        });
        if (targetMessage.senderId === req.session.user!.id) {
            if (req.body.text !== targetMessage.text) {
                await prisma.$extends(messageExtension).message.update({
                    where: {
                        id: Number(req.params.messageId),
                    },
                    data: { text: req.body.text, updatedAt: date },
                });
            }
            const messages = await fetchMessages(req.session.user!.id, Number(req.params.recipientId));
            res.status(200).send(messages);
        } else {
            res.status(403).send("Cannot update someone else's message.");
        }
    } catch (error) {
        console.error("Error deleting cheet from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.delete("/message/:messageId", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkUser(req.params.recipientId, "recipient");
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
