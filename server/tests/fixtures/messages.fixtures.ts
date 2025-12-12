const baseTime = new Date(2000, 0, 1, 0, 0, 0);
export const messageTestMessages = [
	...Array.from({ length: 10 }, (_, i) => ({
		uuid: `testmessageid${i + 1}`,
		text: `Test Message ${i + 1}`,
		senderId: i % 2 ? "testuserid1" : "sessionuserid",
		recipientId: i % 2 ? "sessionuserid" : "testuserid1",
		createdAt: new Date(baseTime.getTime() + i * 1000),
		updatedAt: new Date(baseTime.getTime() + i * 1000),
	})),
];

export const messageTestStatuses = [
	...Array.from({ length: 10 }, (_, i) => ({
		messageId: `testmessageid${i + 1}`,
		isDeleted: false,
		isRead: i <= 7 ? true : false,
	})),
];

export const convosTestMessages = [
	...Array.from({ length: 5 }, (_, i) => ({
		uuid: `testmessageid${i + 1}`,
		text: `Test Convos Message ${i + 1}`,
		senderId: "sessionuserid",
		recipientId: `testuserid${i + 1}`,
		createdAt: new Date(baseTime.getTime() + i * 1000),
		updatedAt: new Date(baseTime.getTime() + i * 1000),
	})),
];

export const convosTestStatuses = [
	...Array.from({ length: 5 }, (_, i) => ({
		messageId: `testmessageid${i + 1}`,
		isDeleted: false,
		isRead: true,
	})),
];
