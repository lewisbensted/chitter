import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserSchema } from "../schemas/user.schema.js";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import { logErrors } from "../utils/logErrors.js";

const router = express.Router();
const prisma = new PrismaClient().$extends({
	query: {
		user: {
			async create({ args, query }) {
				args.data = await UserSchema.parseAsync(args.data);
				return query(args);
			}
		}
	}
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const user = req.body;
		user.password = bcrypt.hashSync(user.password, 5);
		await prisma.user.create({ data: user });
		res.status(200).send("OK");
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			console.error("Error saving user to the database:\n" + logErrors(error));
			res.status(500).send();
		}
	}
});

export default router;
