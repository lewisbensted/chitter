import prisma from "../../prisma/prismaClient.js";

export const checkUser = async (userId?: string, title?: string) => {
    if (userId) {
        if (isNaN(Number(userId))) {
            throw new TypeError(`Invalid ${title ? title : "user"} ID provided - must be a number.`);
        }
        const user = await prisma.user.findUniqueOrThrow({ where: { id: Number(userId) } });
        return user;
    }
};
