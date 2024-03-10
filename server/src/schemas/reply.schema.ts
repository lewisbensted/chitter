import { z } from "zod";

export const ReplySchema = z.object({
	text: z.string().min(5).max(50),
	username: z.string(),
	userId: z.number(),
	cheetId: z.number()
});
