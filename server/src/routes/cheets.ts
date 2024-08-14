import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { CreateCheetSchema, UpdateCheetSchema } from "../schemas/cheet.schema.js";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router({ mergeParams: true });

export const cheetExtension = Prisma.defineExtension({
    query: {
        cheet: {
            async create({ args, query }) {
                args.data = await CreateCheetSchema.parseAsync(args.data);
                return query(args);
            },
            async update({ args, query }) {
                args.data = await UpdateCheetSchema.parseAsync(args.data);
                return query(args);
            },
        },
    },
});

const checkUser = async (userId?: string) => {
    if (userId) {
        if (isNaN(Number(userId))) {
            throw new TypeError("Invalid user ID provided - must be a number.");
        }
        await prisma.user.findUniqueOrThrow({ where: { id: Number(userId) } });
    }
};

export const fetchCheets = async (userId?: number) => {
    const cheets = await prisma.cheet.findMany({
        where: {
            userId: userId ? userId : undefined,
        },
    });
    cheets.sort((cheetA, cheetB) => {
        return cheetA.createdAt.valueOf() - cheetB.createdAt.valueOf();
    });
    return cheets;
};

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkUser(req.params.userId);
        const cheets = await fetchCheets(Number(req.params.userId));
        res.status(200).send({ cheets: cheets });
    } catch (error) {
        console.error("Error retrieving cheets from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkUser(req.params.userId);
        await prisma.$extends(cheetExtension).cheet.create({
            data: {
                userId: req.session.user!.id,
                username: req.session.user!.username,
                text: req.body.text,
            },
        });
        const cheets = await fetchCheets(Number(req.params.userId));
        res.status(201).send({ cheets: cheets });
    } catch (error) {
        console.error("Error adding cheet to the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.put("/:cheetId", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkUser(req.params.userId);
        if (isNaN(Number(req.params.cheetId))) {
            throw new TypeError("Invalid cheet ID provided - must be a number.");
        }
        const targetCheet = await prisma.cheet.findUniqueOrThrow({
            where: { id: Number(req.params.cheetId) },
        });
        if (targetCheet.userId === req.session.user!.id) {
            await prisma.$extends(cheetExtension).cheet.update({
                where: {
                    id: Number(req.params.cheetId),
                },
                data: {
                    text: req.body.text,
                },
            });
            const cheets = await fetchCheets(Number(req.params.userId));
            res.status(200).send({ cheets: cheets });
        } else {
            res.status(403).send("Cannot update someone else's cheet.");
        }
    } catch (error) {
        console.error("Error updating cheet in the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

router.delete("/:cheetId", authMiddleware, async (req: Request, res: Response) => {
    try {
        await checkUser(req.params.userId);
        if (isNaN(Number(req.params.cheetId))) {
            throw new TypeError("Invalid cheet ID provided - must be a number.");
        }
        const targetCheet = await prisma.cheet.findUniqueOrThrow({
            where: { id: Number(req.params.cheetId) },
        });
        if (targetCheet.userId === req.session.user!.id) {
            await prisma.cheet.delete({
                where: {
                    id: Number(req.params.cheetId),
                },
            });
            const cheets = await fetchCheets(Number(req.params.userId));
            res.status(200).send({ cheets: cheets });
        } else {
            res.status(403).send("Cannot delete someone else's cheet.");
        }
    } catch (error) {
        console.error("Error deleting cheet from the database:\n" + logError(error));
        sendErrorResponse(error, res);
    }
});

export default router;
