import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../test-utils/resetDB";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import type { ExtendedUserClient } from "../../types/extendedClients";
import request from "supertest";
import {sessionUser, testUsers } from "../fixtures/users.fixtures";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";

describe("Integration tests - Follow routes", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_follows");
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
		await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
		await (prisma.user as unknown as ExtendedUserClient).createMany({ data: [testUsers[0]] });
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(async () => {
		await prisma.$disconnect();
	});
	describe("Follow user at route [POST] /follow", () => {
		test("Success", async () => {
			const res = await request(app).post("/api/follow/testuserid1").set("session-required", "true");
			expect(res.status).toBe(201);
			const newFollow = await prisma.follow.findFirst({
				where: { followerId: "sessionuserid", followingId: "testuserid1" },
			});
			expect(newFollow).not.toBeNull();
		});
		test("Failure - invalid recipient ID", async () => {
			const res = await request(app).post("/api/follow/invaliduserid").set("session-required", "true");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({ errors: ["The User you are trying to reference could not be found."] });
		});
	});

	describe("Unfollow user at route [DELETE] /follow", () => {
		test("Success", async () => {
			await prisma.follow.create({ data: { followerId: "sessionuserid", followingId: "testuserid1" } });
			const res = await request(app).delete("/api/follow/testuserid1").set("session-required", "true");
			expect(res.status).toBe(204);
			const newFollow = await prisma.follow.findFirst({
				where: { followerId: "sessionuserid", followingId: "testuserid1" },
			});
			expect(newFollow).toBeNull();
		});
		test("Failure - invalid recipient ID", async () => {
			const res = await request(app).delete("/api/follow/invaliduserid").set("session-required", "true");
			expect(res.status).toBe(204);
		});
	});
});
