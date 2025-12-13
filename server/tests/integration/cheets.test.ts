import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../test-utils/resetDB";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import type { ExtendedCheetClient, ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";
import { sessionUser, testUsers } from "../fixtures/users.fixtures";
import { sessionUserCheet, sessionUserCheetStatus, testCheets, testCheetStatuses } from "../fixtures/cheets.fixtures";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";
import type { ICheet } from "../../types/responses";

describe("Integration tests - Cheet routes", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_cheets");
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
	describe("Get cheets at route [GET] /cheets", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).createMany({ data: testUsers });
			await (prisma.cheet as unknown as ExtendedCheetClient).createMany({ data: testCheets });
			await prisma.cheetStatus.createMany({ data: testCheetStatuses });
		});
		test("No userId provided", async () => {
			const res = await request(app).get("/api/cheets");
			const body = res.body as { hasNext: boolean; cheets: ICheet[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(false);
			expect(body.cheets).toHaveLength(10);
			expect(body.cheets[0]).toEqual({
				uuid: "testcheetid10",
				text: "Test Cheet 10",
				createdAt: "2000-01-01T00:00:09.000Z",
				updatedAt: "2000-01-01T00:00:09.000Z",
				user: { uuid: "testuserid1", username: "testuser1" },
				cheetStatus: { hasReplies: false },
			});
		});
		test("userId provided", async () => {
			const res = await request(app).get("/api/users/testuserid1/cheets");
			const body = res.body as { hasNext: boolean; cheets: ICheet[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(false);
			expect(body.cheets).toHaveLength(4);
			expect(body.cheets.every((cheet) => cheet.user.uuid === "testuserid1")).toBe(true);
		});
		test("Empty return", async () => {
			const res = await request(app).get("/api/users/testuserid4/cheets");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ hasNext: false, cheets: [] });
		});
		test("Cursor and take", async () => {
			const res = await request(app).get("/api/cheets?cursor=testcheetid9&take=5");
			const body = res.body as { hasNext: boolean; cheets: ICheet[] };
			expect(res.status).toBe(200);
			expect(body.hasNext).toBe(true);
			expect(body.cheets).toHaveLength(5);
			expect(body.cheets[0].uuid).toBe("testcheetid8");
		});
		test("Failure - invalid user ID", async () => {
			const res = await request(app).get("/api/users/testuserinvalid/cheets");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The User you are trying to access could not be found."] });
		});
	});
	describe("Send cheet at route [POST] /cheets", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
		});
		test("Success", async () => {
			const res = await request(app)
				.post("/api/cheets")
				.set("session-required", "true")
				.send({ text: "New Cheet", uuid: "newcheetid" });
			expect(res.status).toBe(201);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "newcheetid",
					text: "New Cheet",
					user: { uuid: "sessionuserid", username: "sessionuser" },
					cheetStatus: { hasReplies: false },
				})
			);
			const newCheet = await prisma.cheet.findUnique({ where: { uuid: "newcheetid" } });
			const newCheetStatus = await prisma.cheetStatus.findUnique({ where: { cheetId: "newcheetid" } });
			expect(newCheet?.text).toBe("New Cheet");
			expect(newCheetStatus?.hasReplies).toBe(false);
		});
		test("Failure - validation error", async () => {
			const res = await request(app).post("/api/cheets").set("session-required", "true").send();
			expect(res.status).toBe(400);
			expect(res.body).toEqual({ errors: ["Text not provided."] });
		});
	});
	describe("Edit cheet at route [PUT] /cheets/:cheetId", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await prisma.cheet.create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
		});
		test("Success", async () => {
			const res = await request(app)
				.put("/api/cheets/sessionusercheetid")
				.set("session-required", "true")
				.send({ text: "Edited Cheet" });
			expect(res.status).toBe(200);
			expect(res.body).toEqual(
				expect.objectContaining({
					uuid: "sessionusercheetid",
					text: "Edited Cheet",
					user: { uuid: "sessionuserid", username: "sessionuser" },
					cheetStatus: { hasReplies: false },
				})
			);
			const editedCheet = await prisma.cheet.findUnique({ where: { uuid: "sessionusercheetid" } });
			expect(editedCheet).toBeDefined();
			expect(editedCheet!.text).toBe("Edited Cheet");
			expect(editedCheet!.updatedAt.getTime()).toBeGreaterThan(editedCheet!.createdAt.getTime());
		});
		test("Failure - invalid cheet ID", async () => {
			const res = await request(app)
				.put("/api/cheets/testcheetinvalid")
				.set("session-required", "true")
				.send({ text: "Edited Cheet" });
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Cheet you are trying to access could not be found."] });
		});
		test("Failure - validation error", async () => {
			const res = await request(app)
				.put("/api/cheets/sessionusercheetid")
				.set("session-required", "true")
				.send({ text: "Ed" });
			expect(res.status).toBe(400);
			expect(res.body).toEqual({ errors: ["Cheet too short - must be between 5 and 50 characters."] });
		});
	});

	describe("Delete cheet at route [DELETE] /cheets/:cheetId", () => {
		beforeEach(async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			await prisma.cheet.create({ data: sessionUserCheet });
			await prisma.cheetStatus.create({ data: sessionUserCheetStatus });
		});
		test("Success", async () => {
			const res = await request(app).delete("/api/cheets/sessionusercheetid").set("session-required", "true");
			expect(res.status).toBe(204);
			const deletedCheet = await prisma.cheet.findUnique({ where: { uuid: "sessionusercheetid" } });
			expect(deletedCheet).toBeNull();
		});
		test("Failure - invalid cheet ID", async () => {
			const res = await request(app).delete("/api/cheets/testcheetidinvalid").set("session-required", "true");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The Cheet you are trying to access could not be found."] });
		});
	});
});
