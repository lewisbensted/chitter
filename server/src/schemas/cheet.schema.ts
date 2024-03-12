import { z } from "zod";

export const CheetSchema = z.object({
	text: z
		.string()
		.min(5, "Cheet too short. Must be between 5 and 50 characters.")
		.max(50, "Cheet too long. Must be between 5 and 50 characters."),
	username: z.string(),
	userId: z.number()
});
