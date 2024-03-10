import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import { ReplySchema } from "../schemas/reply.schema.js";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { validateCredentials } from "../middleware/validateCredentials.js";
import { ZodError } from "zod";

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient().$extends({
	query: {
		reply: {
			async create({ args, query }) {
				args.data = await ReplySchema.parseAsync(args.data);
				return query(args);
			},
			async update({ args, query }) {
				args.data = await ReplySchema.parseAsync(args.data);
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
		console.error(
			error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
				? "Error retrieving replies from the database. Have all migrations been executed successfully?" +
						error.message.replace(/\n\n/g, " ")
				: "An unknown error has occured."
		);
		res.status(500).send();
	}
});

router.post("/", validateCredentials, async (req: Request, res: Response) => {
	try {
		await prisma.reply.create({
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
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			console.error(
				error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "Error updating reply in the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured."
			);
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
			await prisma.reply.update({
				where: {
					id: Number(req.params.replyId)
				},
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
		} else {
			res.status(403).send("Cannot update someone else's Reply");
		}
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Reply not found.");
		} else {
			console.error(
				error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "Error updating reply in the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured."
			);
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
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Reply not found.");
		} else {
			console.error(
				error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "Error deleting reply from the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured."
			);
			res.status(500).send();
		}
	}
});

export default router;
