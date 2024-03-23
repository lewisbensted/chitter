import express, { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { authenticate } from "../middleware/authenticate.js";
import { Prisma } from "@prisma/client";
import { CheetSchema } from "../schemas/cheet.schema.js";
import { ZodError } from "zod";
import { logErrors } from "../utils/logErrors.js";
import prisma from "../prismaClient.js";

const router = express.Router({ mergeParams: true });
export const cheetExtension = Prisma.defineExtension({
	query: {
		cheet: {
			async create({ args, query }) {
				args.data = await CheetSchema.parseAsync(args.data);
				return query(args);
			},
			async update({ args, query }) {
				args.data = await CheetSchema.partial().parseAsync(args.data);
				return query(args);
			}
		}
	}
});

router.get("/", authenticate, async (req: Request, res: Response) => {
	try {
		const cheets = await prisma.cheet.findMany({
			where: {
				userId: req.params.userId ? Number(req.params.userId) : undefined
			}
		});
		cheets.sort((cheetA, cheetB) => {
			return cheetB.createdAt.valueOf() - cheetA.createdAt.valueOf();
		});
		res.status(200).send(cheets);
	} catch (error) {
		console.error("Error retrieving cheets from the database:\n" + logErrors(error));
		res.status(500).send();
	}
});

router.post("/", authenticate, async (req: Request, res: Response) => {
	try {
		await prisma.$extends(cheetExtension).cheet.create({
			data: { userId: req.session.user!.id, username: req.session.user!.username, text: req.body.text }
		});
		const cheets = await prisma.cheet.findMany({
			where: {
				userId: req.params.userId ? Number(req.params.userId) : undefined
			}
		});
		cheets.sort((cheetA, cheetB) => {
			return cheetB.createdAt.valueOf() - cheetA.createdAt.valueOf();
		});
		res.status(201).send(cheets);
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			console.error("Error adding cheets to the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

router.put("/:cheetId", authenticate, async (req: Request, res: Response) => {
	try {
		const targetCheet = await prisma.cheet.findUniqueOrThrow({
			where: { id: Number(req.params.cheetId) }
		});
		if (targetCheet.userId === req.session.user!.id) {
			await prisma.$extends(cheetExtension).cheet.update({
				where: {
					id: Number(req.params.cheetId)
				},
				data: req.body
			});
			const cheets = await prisma.cheet.findMany({
				where: {
					userId: req.params.userId ? Number(req.params.userId) : undefined
				}
			});
			cheets.sort((cheetA, cheetB) => {
				return cheetB.createdAt.valueOf() - cheetA.createdAt.valueOf();
			});
			res.status(200).send(cheets);
		} else {
			res.status(403).send(["Cannot update someone else's cheet"]);
		}
	} catch (error) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send(["Cheet not found."]);
		} else {
			console.error("Error updating cheet in the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

router.delete("/:cheetId", authenticate, async (req: Request, res: Response) => {
	try {
		const targetCheet = await prisma.cheet.findUniqueOrThrow({
			where: { id: Number(req.params.cheetId) }
		});
		if (targetCheet.userId === req.session.user!.id) {
			await prisma.cheet.delete({
				where: {
					id: Number(req.params.cheetId)
				}
			});
			const cheets = await prisma.cheet.findMany({
				where: {
					userId: req.params.userId ? Number(req.params.userId) : undefined
				}
			});
			cheets.sort((cheetA, cheetB) => {
				return cheetB.createdAt.valueOf() - cheetA.createdAt.valueOf();
			});
			res.status(200).send(cheets);
		} else {
			res.status(403).send("Cannot delete someone else's cheet");
		}
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Cheet not found.");
		} else {
			console.error("Error deleting cheet from the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

export default router;
