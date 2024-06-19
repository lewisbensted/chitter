import express, { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { UserSchema } from "../schemas/user.schema.js";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";

const router = express.Router();
export const registerExtension = Prisma.defineExtension({
	query: {
		user: {
			async create({ args, query }) {
				args.data = await UserSchema.parseAsync(args.data);
				args.data.password = bcrypt.hashSync(args.data.password, 5);
				return query(args);
			},
		},
	},
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const newUser = await prisma
			.$extends(registerExtension)
			.user.create({ data: req.body });
		res.status(201).send(newUser);
	} catch (error) {
		console.error("Error saving user to the database:\n" + logError(error));
		if (error instanceof ZodError) {
			const errors = error.errors.map((err) => err.message);
			res.status(400).send(errors.length === 1 ? errors[0] : errors);
		} else {
			res.status(500).send("An unexpected error occured.");
		}
	}
});

export default router;
