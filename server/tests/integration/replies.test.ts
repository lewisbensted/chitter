import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../test-utils/resetDB";
import { createPrismaClient, ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import { ExtendedCheetClient, ExtendedReplyClient, ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";
import { sessionUserCheet, sessionUserCheetStatus, testCheets } from "../fixtures/cheets.fixtures";
import { sessionUser, testUsers } from "../fixtures/users.fixtures";
import { sessionUserReply, testReplies } from "../fixtures/replies.fixtures";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";
import type { IReply } from "../../types/responses";

describe("Integration tests - Reply routes", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_replies");
		process.env.DATABASE_URL = dbUrl;
		execSync("npx prisma migrate reset --skip-generate --force", { stdio: "inherit" });
		prisma = createPrismaClient(dbUrl);
		await prisma.$connect();
		app = createApp(prisma);
	}, 60000);
	beforeEach(async () => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		await resetDB(prisma);
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(async () => {
		await prisma.$disconnect();
	});
	describe("Get replies at route [GET] /cheets/:cheetId/replies", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
			await (prisma.cheet as unknown as ExtendedCheetClient).createMany({ data: testCheets });
			await (prisma.reply as unknown as ExtendedReplyClient).createMany({ data: testReplies });
		});
		test("Success", async () => {
			const res = await request(app).get("/api/cheets/testcheetid1/replies");
			const body = res.body as { hasNext: boolean; replies: IReply[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(false);
			expect(body.replies).toHaveLength(10);
			expect(body.replies[0]).toEqual(
				expect.objectContaining({
					uuid: "testreplyid10",
					cheetId: "testcheetid1",
					text: "Test Reply 10",
					createdAt: "2001-01-01T00:00:09.000Z",
					updatedAt: "2001-01-01T00:00:09.000Z",
					user: { uuid: "testuserid2", username: "testuser2" },
				})
			);
		});
		test("Empty return", async () => {
			const res = await request(app).get("/api/cheets/testcheetid2/replies");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ hasNext: false, replies: [] });
		});
		test("Cursor and take", async () => {
			const res = await request(app).get("/api/cheets/testcheetid1/replies?cursor=testreplyid9&take=5");
			const body = res.body as { hasNext: boolean; replies: IReply[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(true);
			expect(body.replies).toHaveLength(5);
			expect(body.replies[0].uuid).toBe("testreplyid8");
		});
		test("Failure - Invalid cheet ID provided", async () => {
			const res = await request(app).get("/api/cheets/testcheetidinvalid/replies");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({
				errors: ["The Cheet you are trying to access could not be found."],
			});
		});
	});
	describe("Send reply at route [POST] /cheets/:cheetId/reply", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await (prisma.cheet as unknown as ExtendedCheetClient).create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
		});
		test("Success", async () => {
			const res = await request(app)
				.post("/api/cheets/sessionusercheetid/replies")
				.set("session-required", "true")
				.send({ text: "New Reply", uuid: "newreplyid" });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "newreplyid",
					cheetId: "sessionusercheetid",
					text: "New Reply",
					user: { uuid: "sessionuserid", username: "sessionuser" },
				})
			);
			const newReply = await prisma.reply.findUnique({ where: { uuid: "newreplyid" } });
			const updatedCheetStatus = await prisma.cheetStatus.findUnique({
				where: { cheetId: "sessionusercheetid" },
			});
			expect(newReply?.text).toBe("New Reply");
			expect(updatedCheetStatus?.hasReplies).toBe(true);
		});
		test("Failure - validation error", async () => {
			const res = await request(app)
				.post("/api/cheets/sessionusercheetid/replies")
				.set("session-required", "true")
				.send();
			expect(res.status).toBe(400);
			expect(res.body).toEqual({ errors: ["Text not provided."] });
		});
		test("Failure - invalid cheet ID provided", async () => {
			const res = await request(app)
				.post("/api/cheets/invalidcheetid/replies")
				.set("session-required", "true")
				.send({ text: "New Reply" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Cheet you are trying to reference could not be found."] });
		});
	});
	describe("Edit reply at route [PUT] /replies/:replyId", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await (prisma.cheet as unknown as ExtendedCheetClient).create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
			await (prisma.reply as unknown as ExtendedReplyClient).create({ data: sessionUserReply });
		});
		test("Success", async () => {
			const res = await request(app)
				.put("/api/replies/sessionuserreplyid")
				.set("session-required", "true")
				.send({ text: "Edited Reply" });
			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "sessionuserreplyid",
					cheetId: "sessionusercheetid",
					text: "Edited Reply",
					user: { uuid: "sessionuserid", username: "sessionuser" },
				})
			);
			const editedReply = await prisma.reply.findUnique({ where: { uuid: "sessionuserreplyid" } });
			expect(editedReply?.text).toBe("Edited Reply");
			expect(editedReply?.updatedAt.getTime()).toBeGreaterThan(editedReply?.createdAt?.getTime()!);
		});
		test("Failure - validation error", async () => {
			const res = await request(app)
				.put("/api/replies/sessionuserreplyid")
				.set("session-required", "true")
				.send({ text: "" });
			expect(res.status).toBe(400);
			expect(res.body).toEqual({ errors: ["Reply too short - must be between 5 and 50 characters."] });
		});
		test("Failure - invalid reply ID provided", async () => {
			const res = await request(app)
				.put("/api/replies/invalidreplyid")
				.set("session-required", "true")
				.send({ text: "Edited Reply" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Reply you are trying to access could not be found."] });
		});
	});
	describe("Delete reply at route [DELETE] /replies/:replyId", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await (prisma.cheet as unknown as ExtendedCheetClient).create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
			await (prisma.reply as unknown as ExtendedReplyClient).create({ data: sessionUserReply });
		});
		test("Success", async () => {
			const res = await request(app)
				.delete("/api/replies/sessionuserreplyid")
				.set("session-required", "true")
				.send({ text: "Edited Reply" });
			expect(res.status).toBe(204);
			const deletedReply = await prisma.reply.findUnique({ where: { uuid: "sessionuserreplyid" } });
			expect(deletedReply).toBeNull();
		});
		test("Failure - invalid reply ID provided", async () => {
			const res = await request(app)
				.delete("/api/replies/invalidreplyid")
				.set("session-required", "true")
				.send({ text: "Edited Reply" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Reply you are trying to access could not be found."] });
		});
	});
});
