import { z } from "zod";

export const ReplySchema = z.object({
	text: z
		.string()
		.min(5, "Reply too short. Must be between 5 and 50 characters.")
		.max(50, "Reply too long. Must be between 5 and 50 characters."),
	username: z.string(),
	userId: z.number(),
	cheetId: z.number()
});
