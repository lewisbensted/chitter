import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../test-utils/resetDB";
import { createPrismaClient, type ExtendedPrismaClient } from "../../prisma/prismaClient";
import { createApp } from "../../src/app";
import { sessionUser } from "../fixtures/users.fixtures";
import request from "supertest";
import type { Express } from "express";
import type { ExtendedUserClient } from "../../types/extendedClients";
import type { IError, IUser } from "../../types/responses";
import { createTestDatabase } from "../test-utils/createTestDb";
import { execSync } from "child_process";

describe("Integration tests - Register route", () => {
	let prisma: ExtendedPrismaClient;
	let app: Express;
	beforeAll(async () => {
		const dbUrl = createTestDatabase("chitter_test_register");
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
	describe("Register user at route [POST] /register", () => {
		test("Success", async () => {
			const res = await request(app).post("/api/register").send(sessionUser);
			const body = res.body as IUser;
			expect(res.status).toBe(201);
			expect(body).toEqual({ uuid: "sessionuserid", username: "sessionuser" });
			const newUser = await prisma.user.findUnique({ where: { uuid: "sessionuserid" } });
			expect(newUser?.uuid).toBe("sessionuserid");
			expect(newUser?.username).toBe("sessionuser");
		});
		test("Failure - username and email already exist", async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			const res = await request(app).post("/api/register").send(sessionUser);
			const body = res.body as IError;
			expect(res.status).toBe(400);
			expect(body.errors.sort()).toEqual(["Email address already taken.", "Username already taken."].sort());
		});
		test("Failure - username and email already exist (case insesitive)", async () => {
			await (prisma.user as unknown as ExtendedUserClient).create({ data: sessionUser });
			const res = await request(app)
				.post("/api/register")
				.send({
					...sessionUser,
					uuid: "sessionuseridother",
					username: "sessionUSER",
					email: "sessiONuser@test.com",
				});
			const body = res.body as IError;
			expect(res.status).toBe(400);
			expect(body.errors.sort()).toEqual(["Email address already taken.", "Username already taken."].sort());
		});
	});
});
