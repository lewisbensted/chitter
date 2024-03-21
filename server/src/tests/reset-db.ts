import prisma from "../prismaClient";

export const resetDb = async () => {
	await prisma.$transaction([prisma.reply.deleteMany(), prisma.cheet.deleteMany(), prisma.user.deleteMany()]);
};
