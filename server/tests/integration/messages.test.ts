import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../test-utils/resetDB";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import type { ExtendedMessageClient, ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";
import { sessionUser, testUsers } from "../fixtures/users.fixtures";
import { messageTestMessages, messageTestStatuses } from "../fixtures/messages.fixtures";
import { testConvos } from "../fixtures/conversation.fixtures";
import type { IMessage } from "../../types/responses";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";

describe("Integration tests - Message routes", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_messages");
		process.env.DATABASE_URL = dbUrl;
		execSync("npx prisma migrate reset --skip-generate --force", { stdio: "inherit" });
		prisma = createPrismaClient(dbUrl);
		await prisma.$connect();
		app = createApp(prisma);
	}, 60000);

	beforeEach(async () => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		await resetDB(prisma);
		await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
		await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers.slice(0, 2) });
		await (prisma.message as unknown as ExtendedMessageClient).createMany({ data: messageTestMessages });
		await prisma.messageStatus.createMany({ data: messageTestStatuses });
		await prisma.conversation.create({ data: testConvos[0] });
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(async () => {
		await prisma.$disconnect();
	});

	describe("Get messages at route [GET] /messages/:recipientId", () => {
		test("Success", async () => {
			const res = await request(app).get("/api/messages/testuserid1").set("session-required", "true");
			const body = res.body as { hasNext: boolean; messages: IMessage[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(false);
			expect(body.messages).toHaveLength(10);
			expect(body.messages[0]).toEqual(
				expect.objectContaining({
					uuid: "testmessageid1",
					text: "Test Message 1",
					createdAt: "2000-01-01T00:00:00.000Z",
					updatedAt: "2000-01-01T00:00:00.000Z",
					messageStatus: { isRead: true, isDeleted: false },
					sender: { uuid: "sessionuserid", username: "sessionuser" },
					recipient: { uuid: "testuserid1", username: "testuser1" },
				})
			);
		});
		test("Success - empty return", async () => {
			const res = await request(app).get("/api/messages/testuserid2").set("session-required", "true");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ hasNext: false, messages: [] });
		});
		test("Success - cursor and take", async () => {
			const res = await request(app)
				.get("/api/messages/testuserid1?cursor=testmessageid3&take=5")
				.set("session-required", "true");
			const body = res.body as { hasNext: boolean; messages: IMessage[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(true);
			expect(body.messages).toHaveLength(5);
			expect(body.messages[0].uuid).toBe("testmessageid4");
		});
		test("Failure - invalid recipient ID", async () => {
			const res = await request(app).get("/api/messages/invalidrecipientid").set("session-required", "true");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The User you are trying to access could not be found."] });
		});
	});
	describe("Send message at route [POST] /messages/:recipientId", () => {
		test("Success - conversation updated", async () => {
			const res = await request(app)
				.post("/api/messages/testuserid1")
				.set("session-required", "true")
				.send({ text: "New Message", uuid: "newmessageid1" });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "newmessageid1",
					text: "New Message",
					messageStatus: { isRead: false, isDeleted: false },
					sender: { uuid: "sessionuserid", username: "sessionuser" },
					recipient: { uuid: "testuserid1", username: "testuser1" },
				})
			);
			const convos = await prisma.conversation.findUnique({ where: { key: "sessionuserid:testuserid1" } });
			expect(convos?.user2Unread).toBe(true);
			const newMessage = await prisma.message.findUnique({ where: { uuid: "newmessageid1" } });
			expect(newMessage?.text).toBe("New Message");
			const newMessageStatus = await prisma.messageStatus.findUnique({ where: { messageId: "newmessageid1" } });
			expect(newMessageStatus?.isDeleted).toBe(false);
			expect(newMessageStatus?.isRead).toBe(false);
		});
		test("Success - new conversation created", async () => {
			const res = await request(app)
				.post("/api/messages/testuserid2")
				.set("session-required", "true")
				.send({ text: "New Message", uuid: "newmessageid2" });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(expect.objectContaining({ text: "New Message" }));
			const convos = await prisma.conversation.findUnique({ where: { key: "sessionuserid:testuserid2" } });
			expect(convos?.user2Unread).toBe(true);
			const newMessage = await prisma.message.findUnique({ where: { uuid: "newmessageid2" } });
			expect(newMessage?.text).toBe("New Message");
			const newMessageStatus = await prisma.messageStatus.findUnique({ where: { messageId: "newmessageid2" } });
			expect(newMessageStatus?.isDeleted).toBe(false);
		});
		test("Failure - Invalid recipient ID", async () => {
			const res = await request(app)
				.post("/api/messages/invalidrecipientid")
				.set("session-required", "true")
				.send({ text: "New Message" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({ errors: ["The User you are trying to reference could not be found."] })
			);
		});
		test("Failure - validation error", async () => {
			const res = await request(app)
				.post("/api/messages/invalidrecipientid")
				.set("session-required", "true")
				.send();
			expect(res.status).toBe(400);
			expect(res.body).toEqual(expect.objectContaining({ errors: ["Message not provided."] }));
		});
	});
	describe("Edit message at route [PUT] /messages/:messageId", () => {
		test("Success", async () => {
			const res = await request(app)
				.put("/api/messages/testmessageid9")
				.set("session-required", "true")
				.send({ text: "Edited Message" });
			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "testmessageid9",
					text: "Edited Message",
					messageStatus: { isRead: false, isDeleted: false },
					sender: { uuid: "sessionuserid", username: "sessionuser" },
					recipient: { uuid: "testuserid1", username: "testuser1" },
				})
			);
			const editedMessage = await prisma.message.findUnique({ where: { uuid: "testmessageid9" } });
			expect(editedMessage?.text).toBe("Edited Message");
			expect(editedMessage?.updatedAt.getTime()).toBeGreaterThan(editedMessage?.createdAt?.getTime()!);
		});
		test("Failure - Invalid message ID", async () => {
			const res = await request(app)
				.put("/api/messages/invalidmessageid")
				.set("session-required", "true")
				.send({ text: "Edited Message" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({ errors: ["The Message you are trying to access could not be found."] })
			);
		});
		test("Failure - validation error", async () => {
			const res = await request(app)
				.put("/api/messages/testmessageid9")
				.set("session-required", "true")
				.send({ text: "" });
			expect(res.status).toBe(400);
			expect(res.body).toEqual(expect.objectContaining({ errors: ["Message cannot be empty."] }));
		});
	});
	describe("Delete message at route [DELETE] /messages/:messageId", () => {
		test("Success", async () => {
			const res = await request(app).delete("/api/messages/testmessageid9").set("session-required", "true");
			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "testmessageid9",
					text: null,
					messageStatus: { isRead: false, isDeleted: true },
					sender: { uuid: "sessionuserid", username: "sessionuser" },
					recipient: { uuid: "testuserid1", username: "testuser1" },
				})
			);
			const deletedMessage = await prisma.message.findUnique({
				where: { uuid: "testmessageid9" },
			});
			expect(deletedMessage).not.toBeNull();
			const deletedMessageStatus = await prisma.messageStatus.findUnique({
				where: { messageId: "testmessageid9" },
			});
			expect(deletedMessageStatus).toEqual({ messageId: "testmessageid9", isRead: false, isDeleted: true });
		});
		test("Failure - Invalid message ID", async () => {
			const res = await request(app).delete("/api/messages/invalidmessageid").set("session-required", "true");
			expect(res.status).toBe(404);
			expect(res.body).toEqual(
				expect.objectContaining({ errors: ["The Message you are trying to access could not be found."] })
			);
		});
	});

	describe("Read messages at route [PUT] /messages/:recipientId/read", () => {
		beforeEach(() => {
			vi.spyOn(console, "warn").mockImplementation(vi.fn());
		});
		test("Success", async () => {
			const res = await request(app).put("/api/messages/testuserid1/read").set("session-required", "true");
			expect(res.status).toBe(200);

			//Check last message has been read
			const readMessageStatus = await prisma.messageStatus.findUnique({
				where: { messageId: "testmessageid10" },
			});
			expect(readMessageStatus?.isRead).toBe(true);
		});
		test("Failure - invalid recipient ID", async () => {
			const res = await request(app).put("/api/messages/invalidrecipientid/read").set("session-required", "true");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({
				errors: ["The Conversation you are trying to access could not be found."],
			});
		});
	});
});
