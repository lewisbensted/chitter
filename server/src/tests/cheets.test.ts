import { beforeEach, test, describe, vi, expect } from "vitest";
import prisma from "../prismaClient";
import { registerExtension } from "../routes/register";
import { resetDb } from "./reset-db";
import { testUser1, testUser2 } from "./fixtures/users.fixtures";
import cheets, { cheetExtension } from "../routes/cheets";
import { testCheets } from "./fixtures/cheets.fixtures";
import express from "express";
import request from "supertest";
import { Cheet } from "@prisma/client";

describe("Test cheets routers", () => {
	vi.mock("./../middleware/authenticate", () => ({
		authenticate: vi.fn((req, _res, next) => {
			next();
		})
	}));
	beforeEach(async () => {
		await resetDb();
		await prisma.$extends(registerExtension).user.create({ data: testUser1 });
		await prisma.$extends(registerExtension).user.create({ data: testUser2 });
		for (const testCheet of testCheets) {
			await prisma.$extends(cheetExtension).cheet.create({ data: testCheet });
		}
	});
	const testApp = express();
	testApp.use("/cheets", express.json(), cheets);
	testApp.use("/users/:userId/cheets", express.json(), cheets);
	describe("Fetch cheets at route: [GET] /cheets.", async () => {
		test("Responds with HTTP status 200 and all cheets when a userID is not provided as a parameter", async () => {
			const { status, body } = await request(testApp).get("/cheets");
			expect(status).toEqual(200);
			expect(body).length(5);
			expect(body.filter((cheet: Cheet) => cheet.username == "testuser1")).length(3);
			expect(body.filter((cheet: Cheet) => cheet.username == "testuser2")).length(2);
		});
		test("Responds with HTTP status 200 and cheets releavnt to a particular user when a userID is provided as a parameter", async () => {
			const request1 = await request(testApp).get("/users/1/cheets");
			expect(request1.status).toEqual(200);
			expect(request1.body).length(3);
			expect(request1.body.filter((cheet: Cheet) => cheet.username === "testuser1")).length(3);

			const request2 = await request(testApp).get("/users/2/cheets");
			expect(request2.status).toEqual(200);
			expect(request2.body).length(2);
			expect(request2.body.filter((cheet: Cheet) => cheet.username === "testuser2")).length(2);

			const request3 = await request(testApp).get("/users/3/cheets");
			expect(request3.status).toEqual(200);
			expect(request3.body).length(0);
		});
		test("Responds with HTTP status 200 and cheets ordered in descending chronological order", async () => {
			const { status, body } = await request(testApp).get("/cheets");
			expect(status).toEqual(200);
			expect(body).length(5);
			for (let x = 0; x < body.length - 1; x++) {
				expect(body[x].createdAt >= body[x + 1].createdAt).toBe(true);
			}
		});
	});

	// describe("Post a new cheet at route: [POST] /cheets.", async () => {
	// 	test("Responds with HTTP status 201 and all cheets when a new cheet is created", async () => {});
	// 	test("Responds with HTTP status 400 if cheet validation fails", async () => {});
	// });

	// describe("Updates an existing cheet at route: [PUT] /cheets.", async () => {
	// 	test("Responds with HTTP status 200 and all cheets when an existing cheet is updated", async () => {});
	// 	test("Responds with HTTP status 400 if cheet validation fails", async () => {});
	// 	test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to update someone else's cheet)", async () => {});
	// 	test("Responds with HTTP status 404 if the cheet to be updated does not exist in the database", async () => {});
	// });

	// describe("deletes an existing cheet at route: [DELETE] /cheets.", async () => {
	// 	test("Responds with HTTP status 200 and all cheets when an existing cheet is deleted", async () => {});
	// 	test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to delete someone else's cheet)", async () => {});
	// 	test("Responds with HTTP status 404 if the cheet to be delete does not exist in the database", async () => {});
	// });
});
