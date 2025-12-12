import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../test-utils/resetDB";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import { ExtendedUserClient } from "../../types/extendedClients";
import { sessionUser, testUsers } from "../fixtures/users.fixtures";
import request from "supertest";
import { testConvos } from "../fixtures/conversation.fixtures";
import { convosTestMessages, convosTestStatuses } from "../fixtures/messages.fixtures";
import type { IConversation } from "../../types/responses";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";

describe("Integration tests - Conversation routes", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_convos");
		process.env.DATABASE_URL = dbUrl;
		execSync("npx prisma migrate reset --skip-generate --force", { stdio: "inherit" });
		prisma = createPrismaClient(dbUrl);
		await prisma.$connect();
		app = createApp(prisma);
	}, 60000);
	beforeEach(async () => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		vi.spyOn(console, "warn").mockImplementation(vi.fn());
		await resetDB(prisma);
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(async () => {
		await prisma.$disconnect();
	});
	describe("Get unread boolean at route [GET] /conversations/unread", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
			await prisma.message.createMany({ data: convosTestMessages });
			await prisma.messageStatus.createMany({ data: convosTestStatuses });
			await prisma.conversation.createMany({ data: testConvos });
		});
		test("No userId provided", async () => {
			const res = await request(app).get("/api/conversations/unread").set("session-required", "true");
			expect(res.status).toBe(200);
			expect(res.body).toBe(false);
		});
	});
	describe("Get conversations at route [GET] /conversations", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
			await prisma.message.createMany({ data: convosTestMessages });
			await prisma.messageStatus.createMany({ data: convosTestStatuses });
			await prisma.conversation.createMany({ data: testConvos });
		});
		test("No user IDs provided", async () => {
			const res = await request(app).get("/api/conversations").set("session-required", "true");
			const body = res.body as { hasNext: boolean; conversations: IConversation[] };
			expect(res.status).toBe(200);
			expect(body.conversations).toHaveLength(5);
			expect(body.hasNext).toBe(false);
			expect(body.conversations[0]).toEqual(
				expect.objectContaining({
					key: "sessionuserid:testuserid5",
					interlocutorId: "testuserid5",
					interlocutorUsername: "testuser5",
					latestMessage: {
						uuid: "testmessageid5",
						text: "Test Convos Message 5",
						createdAt: "2000-01-01T00:00:04.000Z",
						updatedAt: "2000-01-01T00:00:04.000Z",
						messageStatus: { isRead: true, isDeleted: false },
						sender: { uuid: "sessionuserid", username: "sessionuser" },
						recipient: { uuid: "testuserid5", username: "testuser5" },
					},
					unread: false,
				})
			);
		});
		test("User IDs provided", async () => {
			const res = await request(app)
				.get("/api/conversations?userIds=testuserid1,testuserid3")
				.set("session-required", "true");
			const body = res.body as { hasNext: boolean; conversations: IConversation[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(false);
			expect(body.conversations).toHaveLength(2);
			expect(body.conversations).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ key: "sessionuserid:testuserid1" }),
					expect.objectContaining({ key: "sessionuserid:testuserid3" }),
				])
			);
		});
		test("Empty return", async () => {
			const res = await request(app)
				.get("/api/conversations?userIds=testuserid10")
				.set("session-required", "true");
			const body = res.body as { hasNext: boolean; conversations: IConversation[] };
			expect(res.status).toBe(200);
			expect(body.conversations).toEqual([]);
			expect(body.hasNext).toBe(false);
		});
		test("Cursor and take", async () => {
			const res = await request(app)
				.get("/api/conversations?cursor=sessionuserid:testuserid4&take=2")
				.set("session-required", "true");
			const body = res.body as { hasNext: boolean; conversations: IConversation[] };
			expect(body.hasNext).toBe(true);
			expect(body.conversations).toHaveLength(2);
			expect(body.conversations[0].key).toBe("sessionuserid:testuserid3");
		});
	});
});
