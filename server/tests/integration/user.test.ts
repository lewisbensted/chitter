import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import request from "supertest";
import { resetDB } from "../test-utils/resetDB";
import { testUsers } from "../fixtures/users.fixtures";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import type { Express } from "express";
import type { IUser } from "../../types/responses";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";

describe("Integration tests - User routes", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_users");
		process.env.DATABASE_URL = dbUrl;
		execSync("npx prisma migrate reset --skip-generate --force", { stdio: "inherit" });
		prisma = createPrismaClient(dbUrl);
		await prisma.$connect();
		app = createApp(prisma);
	}, 60000);
	beforeEach(async () => {
		vi.spyOn(console, "error").mockImplementation(vi.fn());
		await resetDB(prisma);
		await prisma.user.createMany({ data: testUsers });
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});
	afterAll(async () => {
		await prisma.$disconnect();
	});
	describe("Get user at route [GET] /user/:userId", () => {
		test("Success", async () => {
			const res = await request(app).get("/api/users/testuserid1");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({
				user: {
					username: "testuser1",
					uuid: "testuserid1",
				},
				isFollowing: null,
			});
		});
		test("Failure - user not found", async () => {
			const res = await request(app).get("/api/users/testuserinvalid");
			expect(res.status).toBe(404);
			expect(res.body).toEqual({
				errors: ["The User you are trying to access could not be found."],
			});
		});
	});
	describe("Search users at route [GET] /users", () => {
		test("Search string provided", async () => {
			const res = await request(app).get("/api/users?search=test");
			const body = res.body as { hasNext: boolean; users: { user: IUser[] }[] };
			expect(res.status).toBe(200);
			expect(body.users).toHaveLength(5);
			expect(body.hasNext).toBe(false);
			expect(body.users[0]).toEqual({
				user: { uuid: "testuserid1", username: "testuser1" },
				isFollowing: null,
			});
		});
		test("Search string provided (case insensetive)", async () => {
			const res = await request(app).get("/api/users?search=tESt");
			const body = res.body as { hasNext: boolean; users: { user: IUser[] }[] };
			expect(res.status).toBe(200);
			expect(body.users).toHaveLength(5);
		});
		test("No search string provided", async () => {
			const res = await request(app).get("/api/users");
			expect(res.status).toBe(200);
			expect(res.body).toEqual({ users: [], hasNext: false });
		});
		test("Cursor and take", async () => {
			const res = await request(app).get("/api/users?search=test&cursor=testuserid1&take=2");
			const body = res.body as { hasNext: boolean; users: { user: IUser[] }[] };
			expect(res.status).toBe(200);
			expect(body.users).toHaveLength(2);
			expect(body.hasNext).toBe(true);
			expect(body.users[0].user).toEqual({ uuid: "testuserid2", username: "testuser2" });
		});
	});
});
