import { beforeEach, expect, test, describe } from "vitest";
import prisma from "../prismaClient";
import { registerExtension } from "../routes/register";
import { resetDb } from "./reset-db";
import { testUser1, testUser2 } from "./fixtures/users.fixtures";
import { cheetExtension } from "../routes/cheets";
import { cheets } from "./fixtures/cheets.fixtures";

describe("Test cheets routers", () => {
	beforeEach(async () => {
		await resetDb();
		await prisma.$extends(registerExtension).user.create({ data: testUser1 });
		await prisma.$extends(registerExtension).user.create({ data: testUser2 });
		await prisma.$extends(cheetExtension).cheet.createMany({ data: cheets });
	});
	describe("Fetch cheets at route: [GET] /cheets.", async () => {
		test("Responds with HTTP status 200 and all cheets when a userID is not provided as a parameter", async () => {});
		test("Responds with HTTP status 200 and cheets releavnt to a particular user when a userID is provided as a parameter", async () => {});
		test("Responds with HTTP status 200 and cheets ordered in ascending chronological order", async () => {});
	});

	describe("Post a new cheet at route: [POST] /cheets.", async () => {
		test("Responds with HTTP status 201 and all cheets when a new cheet is created", async () => {});
		test("Responds with HTTP status 400 if cheet validation fails", async () => {});
	});

	describe("Updates an existing cheet at route: [PUT] /cheets.", async () => {
		test("Responds with HTTP status 200 and all cheets when an existing cheet is updated", async () => {});
		test("Responds with HTTP status 400 if cheet validation fails", async () => {});
		test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to update someone else's cheet)", async () => {});
		test("Responds with HTTP status 404 if the cheet to be updated does not exist in the database", async () => {});
	});

	describe("deletes an existing cheet at route: [DELETE] /cheets.", async () => {
		test("Responds with HTTP status 200 and all cheets when an existing cheet is deleted", async () => {});
		test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to delete someone else's cheet)", async () => {});
		test("Responds with HTTP status 404 if the cheet to be delete does not exist in the database", async () => {});
	});
});
