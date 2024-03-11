import { Cheet, PrismaClient, Reply, User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { logErrors } from "../src/utils/logErrors.js";

config({ path: `.env.${process.env.NODE_ENV}` });

const prisma = new PrismaClient();

async function seed() {
	if (!process.env.NODE_ENV || !["development", "test"].includes(process.env.NODE_ENV)) {
		throw new Error("This action is only permissable in the development or test environments.");
	}

	await prisma.reply.deleteMany();
	await prisma.cheet.deleteMany();
	await prisma.user.deleteMany();

	const users: User[] = [];
	const cheets: Cheet[] = [];
	const replies: Reply[] = [];

	const numUsers = 30;

	let cheetId = 1;
	let replyId = 1;

	for (let userId = 1; userId <= numUsers; userId++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const username = faker.internet.userName({ firstName: firstName, lastName: lastName });

		users.push({
			id: userId,
			firstName,
			lastName,
			email: faker.internet.email({ firstName: firstName, lastName: lastName }),
			username: username,
			password: faker.internet.password()
		});

		for (let userCheet = 1; userCheet < Math.ceil(Math.random() * 10) + 1; userCheet++) {
			cheets.push({
				id: cheetId,
				userId: userId,
				text: faker.lorem.sentence(),
				username: username,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			for (let cheetReply = 1; cheetReply < Math.ceil(Math.random() * 10) + 1; cheetReply++) {
				replies.push({
					id: replyId,
					userId: Math.ceil(Math.random() * numUsers),
					text: faker.lorem.sentence(),
					cheetId: cheetId,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: username
				});

				replyId++;
			}
			cheetId++;
		}
	}

	await prisma.user.createMany({ data: users });
	await prisma.cheet.createMany({ data: cheets });
	await prisma.reply.createMany({ data: replies });
}

prisma
	.$connect()
	.then(async () => {
		await seed();
		console.log("Test data successfully seeded to database.");
	})
	.catch((error) => {
		console.error("Error seeding test data to database:\n" + logErrors(error));
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
