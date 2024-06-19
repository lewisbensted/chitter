import { z } from "zod";
import prisma from "../../prisma/prismaClient.js";

export const firstNameExp = /^[a-zA-Z]{2,}((-| )[a-zA-Z]{2,})?$/;
export const lastNameExp =
	/^([a-zA-Z]')?[a-zA-Z]{2,}((-([a-zA-Z]')?[a-zA-Z]{2,}){0,2}|( ([a-zA-Z]')?[a-zA-Z]{2,}){0,2})$/;
export const passwordExp =
	/^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^\*\.()%!-/\\])\S+$/;

export const UserSchema = z.object({
	id: z.number().optional(),
	firstName: z
		.string({ required_error: "First name not provided." })
		.min(2, "First name too short. Must be at least 2 characters.")
		.max(20, "First name too long. Must be less than 20 characters.")
		.regex(
			firstNameExp,
			"First name can be at most 2 words and cannot contain numbers or special characters."
		),
	lastName: z
		.string({ required_error: "Last name not provided." })
		.min(2, "Last name too short. Must be at least 2 characters.")
		.max(20, "Last name too long. Must be less than 20 characters.")
		.regex(
			lastNameExp,
			"Last name can be at most 3 words and cannot contain numbers or special characters."
		),
	email: z
		.string({ required_error: "Email address not provided." })
		.email("Invalid email address.")
		.refine(async (email) => {
			const user = await prisma.user.findUnique({ where: { email: email } });
			return user ? false : true;
		}, "Email address already taken."),
	username: z
		.string({ required_error: "Username not provided." })
		.min(5, "Username too short. Must be at least 5 characters.")
		.max(30, "Username too long. Must be less than 30 characters.")
		.refine(async (username) => {
			const user = await prisma.user.findUnique({
				where: { username: username },
			});
			return user ? false : true;
		}, "Username already taken."),
	password: z
		.string({ required_error: "Password not provided." })
		.min(8, "Password too short. Must be at least 8 characters.")
		.max(30, "Password too long. Must be less than 30 characters.")
		.regex(
			passwordExp,
			"Password must contain at least one number, one letter and one special character but no spaces."
		),
});
