
export const testConvos = [
	...Array.from({ length: 5 }, (_, i) => ({
		key: `sessionuserid:testuserid${i + 1}`,
		latestMessageId: `testmessageid${i + 1}`,
		user1Id: "sessionuserid",
		user1Unread: false,
		user2Id: `testuserid${i + 1}`,
		user2Unread: false,
	})),
];
