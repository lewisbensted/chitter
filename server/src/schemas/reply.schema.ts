import { z } from "zod";

export const ReplySchema = z.object({
	id: z.number().optional(),
	userId: z.number({ required_error: "User ID not provided." }),
	username: z.string({ required_error: "Username not provided." }),
	text: z
		.string({ required_error: "Text not provided." })
		.min(5, "Reply too short. Must be between 5 and 50 characters.")
		.max(50, "Reply too long. Must be between 5 and 50 characters."),
	cheetId: z.number({ required_error: "Cheet ID not provided." }),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});
