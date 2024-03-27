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
import session from "express-session";

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
	const sessionApp = express();
	sessionApp.use(session({ secret: "secret-key" }));
	sessionApp.all("*", (req, res, next) => {
		req.session.user = { id: 1, username: "testuser1" };
		next();
	});
	sessionApp.use(testApp);

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

	describe("Post a new cheet at route: [POST] /cheets.", async () => {
		test("Responds with HTTP status 201 and all cheets when a new cheet is created.", async () => {
			const { status, body } = await request(sessionApp).post("/cheets").send({ text: "testuser1: new test cheet" });
			expect(status).toEqual(201);
			expect(body).length(6);
			expect(body[0].text).toEqual("testuser1: new test cheet");
			expect(body[0].userId).toEqual(1);
			expect(body[0].username).toEqual("testuser1");
		});
		test("Responds with HTTP status 400 if cheet validation fails", async () => {
			const { status, body } = await request(sessionApp).post("/cheets").send({ text: "tes" });
			expect(status).toEqual(400);
			expect(body).length(1);
			expect(body[0]).toEqual("Cheet too short. Must be between 5 and 50 characters.");
		});
	});

	describe("Updates an existing cheet at route: [PUT] /cheets.", async () => {
		test("Responds with HTTP status 200 and all cheets when an existing cheet is updated", async () => {
			const { status, body } = await request(sessionApp)
				.put("/cheets/1")
				.send({ text: "testuser1: test cheet 1 - updated" });
			expect(status).toEqual(200);
			expect(body).length(5);
			const updatedCheet = body.filter((cheet: Cheet) => cheet.id == 1);
			expect(updatedCheet).length(1);
			expect(updatedCheet[0].text).toEqual("testuser1: test cheet 1 - updated");
			expect(updatedCheet[0].userId).toEqual(1);
			expect(updatedCheet[0].updatedAt > updatedCheet[0].createdAt).toBe(true);
		});
		test("Responds with HTTP status 400 if cheet validation fails", async () => {
			const { status, body } = await request(sessionApp).put("/cheets/1").send({ text: "te" });
			expect(status).toEqual(400);
			expect(body).length(1);
			expect(body[0]).toEqual("Cheet too short. Must be between 5 and 50 characters.");
		});
		test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to update someone else's cheet)", async () => {
			const { status, body } = await request(sessionApp)
				.put("/cheets/2")
				.send({ text: "testuser2: test cheet 1 - updated" });
			expect(status).toEqual(403);
			expect(body).length(1);
			expect(body[0]).toEqual("Cannot update someone else's cheet");
		});
		test("Responds with HTTP status 404 if the cheet to be updated does not exist in the database", async () => {
			const { status, body } = await request(sessionApp).put("/cheets/6").send({ text: "update nonexistent cheet" });
			expect(status).toEqual(404);
			expect(body).length(1);
			expect(body[0]).toEqual("Cheet not found.");
		});
	});

	describe("deletes an existing cheet at route: [DELETE] /cheets.", async () => {
		test("Responds with HTTP status 200 and all cheets when an existing cheet is deleted", async () => {
			const { status, body } = await request(sessionApp).delete("/cheets/1");
			expect(status).toEqual(200);
			expect(body).length(4);
			expect(body.map((cheet: Cheet) => cheet.id)).not.toContain(1);
		});
		test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to delete someone else's cheet)", async () => {
			const { status, body } = await request(sessionApp).delete("/cheets/2");
			expect(status).toEqual(403);
			expect(body[0]).toEqual("Cannot delete someone else's cheet");
		});
		test("Responds with HTTP status 404 if the cheet to be delete does not exist in the database", async () => {
			const { status, body } = await request(sessionApp).delete("/cheets/6");
			expect(status).toEqual(404);
			expect(body[0]).toEqual("Cheet not found.");
		});
	});
});
