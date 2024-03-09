import express, { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";
import { UserSchema } from "../schema/user.schema.js";
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { ZodError } from "zod";

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

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	try {
		await prisma.user.create({ data: req.body });
		res.status(200).send("OK");
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			console.error(
				"\nSomething went wrong!\n"+
				(error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError
					? "User could not be saved to the database. Have all migrations been executed successfully?" +
							error.message.replace(/\n\n/g, " ")
					: "An unknown error has occured.")
			);

			res.status(500).send();
			process.exit(1);
		}
	}
});

export default router;
