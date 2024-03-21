import { z } from "zod";
import prisma from "../prismaClient.js";

export const UserSchema = z.object({
	id: z.number().optional(),
	firstName: z
		.string()
		.min(2, "First name too short. Must be at least 2 characters.")
		.max(20, "First name too long. Must be less than 20 characters.")
		.regex(/^[a-zA-Z]+$/, "First name cannot contain spaces, numbers or special characters."),
	lastName: z
		.string()
		.min(2, "Last name too short. Must be at least 2 characters.")
		.max(20, "Last name too long. Must be less than 20 characters.")
		.regex(/^[a-zA-Z]+$/, "Last name cannot contain spaces, numbers or special characters."),
	email: z
		.string()
		.email("Invalid email address.")
		.refine(async (email) => {
			const user = await prisma.user.findUnique({ where: { email: email } });
			return user ? false : true;
		}, "Email address already taken."),
	username: z
		.string()
		.min(5, "Username too short. Must be at least 5 characters.")
		.max(30, "Username too long. Must be less than 30 characters.")
		.refine(async (username) => {
			const user = await prisma.user.findUnique({ where: { username: username } });
			return user ? false : true;
		}, "Username already taken."),
	password: z
		.string()
		.min(8, "Password too short. Must be at least 8 characters.")
		.max(30, "Password too long. Must be less than 30 characters.")
		.regex(
			/^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!-]).+$/,
			"Password must contain at least one number, one letter and one special character."
		)
});
