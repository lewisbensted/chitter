import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

export const UserSchema = z.object({
	firstName: z.string().min(2),
	lastName: z.string().min(5),
	email: z
		.string()
		.email()
		.refine(
			async (email) => {
				const user = await prisma.user.findFirst({ where: { username: email } });
				return user ? false : true;
			},
			{ message: "email taken" }
		),
	username: z.string().refine(
		async (username) => {
			const user = await prisma.user.findFirst({ where: { username: username } });
			return user ? false : true;
		},
		{ message: "username taken" }
	),
	password: z.string()
});
