import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";

export const resetDB = async (prismaClient: ExtendedPrismaClient) => {
	await prismaClient.$transaction([
		prismaClient.reply.deleteMany(),
		prismaClient.cheetStatus.deleteMany(),
		prismaClient.cheet.deleteMany(),
		prismaClient.conversation.deleteMany(),
		prismaClient.messageStatus.deleteMany(),
		prismaClient.message.deleteMany(),
		prismaClient.user.deleteMany(),
	]);
};
