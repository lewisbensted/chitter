import { Prisma } from "@prisma/client";
import express, { Request, Response } from "express";
import { ReplySchema } from "../schemas/reply.schema.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { validateCredentials } from "../middleware/validateCredentials.js";
import { ZodError } from "zod";
import { logErrors } from "../utils/logErrors.js";
import prisma from "../client.js";

const router = express.Router({ mergeParams: true });
const replyExtension = Prisma.defineExtension({
	query: {
		reply: {
			async create({ args, query }) {
				args.data = await ReplySchema.parseAsync(args.data);
				return query(args);
			},
			async update({ args, query }) {
				args.data = await ReplySchema.partial().parseAsync(args.data);
				return query(args);
			}
		}
	}
});

router.get("/", validateCredentials, async (req: Request, res: Response) => {
	try {
		const replies = await prisma.reply.findMany({
			where: {
				cheetId: Number(req.params.cheetId)
			}
		});
		replies.sort((replyA, replyB) => {
			return replyB.createdAt.valueOf() - replyA.createdAt.valueOf();
		});
		res.status(200).send(replies);
	} catch (error) {
		console.error("Error retrieving replies from the database:\n" + logErrors(error));
		res.status(500).send();
	}
});

router.post("/", validateCredentials, async (req: Request, res: Response) => {
	try {
		await prisma.$extends(replyExtension).reply.create({
			data: {
				userId: req.session.user!.id,
				username: req.session.user!.username,
				text: req.body.text,
				cheetId: Number(req.params.cheetId)
			}
		});
		const replies = await prisma.reply.findMany({
			where: {
				cheetId: Number(req.params.cheetId)
			}
		});
		replies.sort((replyA, replyB) => {
			return replyB.createdAt.valueOf() - replyA.createdAt.valueOf();
		});
		res.status(200).send(replies);
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			console.error("Error adding reply to the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

router.put("/:replyId", validateCredentials, async (req: Request, res: Response) => {
	try {
		const targetReply = await prisma.reply.findUniqueOrThrow({
			where: { id: Number(req.params.replyId) }
		});
		if (targetReply.userId === req.session.user!.id) {
			await prisma.$extends(replyExtension).reply.update({
				where: {
					id: Number(req.params.replyId)
				},
				data: req.body
			});
			const replies = await prisma.reply.findMany({
				where: {
					cheetId: Number(req.params.cheetId)
				}
			});
			replies.sort((replyA, replyB) => {
				return replyB.createdAt.valueOf() - replyA.createdAt.valueOf();
			});
			res.status(200).send(replies);
		} else {
			res.status(403).send("Cannot update someone else's Reply");
		}
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Reply not found.");
		} else {
			console.error("Error updating reply in the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

router.delete("/:replyId", validateCredentials, async (req: Request, res: Response) => {
	try {
		const targetReply = await prisma.reply.findUniqueOrThrow({
			where: { id: Number(req.params.replyId) }
		});
		if (targetReply.userId === req.session.user!.id) {
			await prisma.reply.delete({
				where: {
					id: Number(req.params.replyId)
				}
			});
			const replies = await prisma.reply.findMany({
				where: {
					cheetId: Number(req.params.cheetId)
				}
			});
			replies.sort((replyA, replyB) => {
				return replyB.createdAt.valueOf() - replyA.createdAt.valueOf();
			});
			res.status(200).send(replies);
		} else {
			res.status(403).send("Cannot delete someone else's Reply.");
		}
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Reply not found.");
		} else {
			console.error("Error deleting reply from the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

export default router;
