import { Cheet } from "@prisma/client";

export const cheets: Cheet[] = [
	{
		id: 1,
		username: "testuser1",
		text: "testuser1: test cheet 1",
		userId: 1,
		createdAt: new Date(1 / 1 / 2020),
		updatedAt: new Date(1 / 1 / 2020)
	},
	{
		id: 2,
		username: "testuser2",
		text: "testuser2: test cheet 1",
		userId: 2,
		createdAt: new Date(1 / 1 / 2020),
		updatedAt: new Date(1 / 1 / 2020)
	},
	{
		id: 3,
		username: "testuser1",
		text: "testuser1: test cheet 2",
		userId: 1,
		createdAt: new Date(1 / 1 / 2020),
		updatedAt: new Date(1 / 1 / 2020)
	},
	{
		id: 4,
		username: "testuser1",
		text: "testuser1: test cheet 3",
		userId: 1,
		createdAt: new Date(1 / 1 / 2020),
		updatedAt: new Date(1 / 1 / 2020)
	},
	{
		id: 5,
		username: "testuser2",
		text: "testuser2: test cheet 2",
		userId: 2,
		createdAt: new Date(1 / 1 / 2020),
		updatedAt: new Date(1 / 1 / 2020)
	}
];
