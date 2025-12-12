import { PrismaClient } from "@prisma/client";
import { cheetExtension } from "./extensions/cheetExtension.js";
import { replyExtension } from "./extensions/replyExtension.js";
import { userExtension } from "./extensions/userExtension.js";
import { messageExtension } from "./extensions/messageExtension.js";
import { conversationExtension } from "./extensions/conversationExtension.js";

export const createPrismaClient = (dbUrl?: string) =>
	new PrismaClient({
		datasources: dbUrl
			? {
				db: {
					url: dbUrl,
				},
			}
			: undefined,
	})
		.$extends(userExtension)
		.$extends(cheetExtension)
		.$extends(replyExtension)
		.$extends(messageExtension)
		.$extends(conversationExtension);

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;
