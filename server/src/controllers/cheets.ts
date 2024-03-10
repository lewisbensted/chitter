import express, { Request, Response } from "express";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { validateCredentials } from "../middleware/validateCredentials.js";
import { PrismaClient } from "@prisma/client";
import { CheetSchema } from "../schemas/cheet.schema.js";
import { ZodError } from "zod";

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient().$extends({
	query: {
		cheet: {
			async create({ args, query }) {
				args.data = await CheetSchema.parseAsync(args.data);
				return query(args);
			},
			async update({ args, query }) {
				args.data = await CheetSchema.parseAsync(args.data);
				return query(args);
			}
		}
	}
});

router.get("/", validateCredentials, async (req: Request, res: Response) => {
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
	} catch (error: unknown) {
		console.error(
			error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
				? "Error retrieving cheets from the database. Have all migrations been executed successfully?" +
						error.message.replace(/\n\n/g, " ")
				: "An unknown error has occured."
		);
		res.status(500).send();
	}
});

router.post("/", validateCredentials, async (req: Request, res: Response) => {
	try {
		await prisma.cheet.create({
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
		res.status(200).send(cheets);
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			console.error(
				error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "Error adding cheet to the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured."
			);
			res.status(500).send();
		}
	}
});

router.put("/:cheetId", validateCredentials, async (req: Request, res: Response) => {
	try {
		const targetCheet = await prisma.cheet.findUniqueOrThrow({
			where: { id: Number(req.params.cheetId) }
		});
		if (targetCheet.userId === req.session.user!.id) {
			await prisma.cheet.update({
				where: {
					id: Number(req.params.cheetId)
				},
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
			res.status(200).send(cheets);
		} else {
			res.status(403).send("Cannot update someone else's Cheet");
		}
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Cheet not found.");
		} else {
			console.error(
				error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "Error updating cheet in the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured."
			);
			res.status(500).send();
		}
	}
});

router.delete("/:cheetId", validateCredentials, async (req: Request, res: Response) => {
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
			res.status(403).send("Cannot delete someone else's Cheet");
		}
	} catch (error: unknown) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			res.status(404).send("Cheet not found.");
		} else {
			console.error(
				error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "Error deleting cheet from the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured."
			);
			res.status(500).send();
		}
	}
});

export default router;
