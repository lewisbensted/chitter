import prisma from "../client";

export const resetDb = async () => {
	await prisma.$transaction([prisma.reply.deleteMany(), prisma.cheet.deleteMany(), prisma.user.deleteMany()]);
};

