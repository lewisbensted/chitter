import { test, describe, beforeEach, expect } from "vitest";
import { resetDb } from "./reset-db";
import prisma from "../prismaClient";
import login from "../routes/login";
import express from "express";
import request from "supertest";
import session from "express-session";
import { testUser1 } from "./fixtures/users.fixtures";
import { registerExtension } from "../routes/register";

describe("Login with an existing user at route: [POST] /login.", async () => {
	beforeEach(async () => {
		await resetDb();
		await prisma.$extends(registerExtension).user.create({ data: testUser1 });
	});

	const testApp = express();
	testApp.use("/login", express.json(), login);

	test("Responds with HTTP status 403 if a user already exist on the session object (is already logged in).", async () => {
		const sessionApp = express();
		sessionApp.use(session({ secret: "secret-key" }));
		sessionApp.all("/login", (req, res, next) => {
			req.session.user = { id: 1, username: "testuser" };
			next();
		});
		sessionApp.use(testApp);
		const { status, body } = await request(sessionApp)
			.post("/login")
			.send({ username: "testuser1", password: "password1!" });
		expect(status).toEqual(403);
		expect(body).length(1);
		expect(body).toContain("Already logged in");
	});
	test("Responds with HTTP status 404 if a user does not exist in the database.", async () => {
		const sessionApp = express();
		sessionApp.use(session({ secret: "secret-key" }));
		sessionApp.all("/login", (req, res, next) => {
			next();
		});
		sessionApp.use(testApp);
		const { status, body } = await request(sessionApp)
			.post("/login")
			.send({ username: "testuser", password: "password1!" });
		expect(status).toEqual(404);
		expect(body).length(1);
		expect(body).toContain("User not found");
	});
	test("Responds with HTTP status 401 if the password provided in the params does not match the decrypted value from the database.", async () => {
		const sessionApp = express();
		sessionApp.use(session({ secret: "secret-key" }));
		sessionApp.all("/login", (req, res, next) => {
			next();
		});
		sessionApp.use(testApp);
		const { status, body } = await request(sessionApp)
			.post("/login")
			.send({ username: "testuser1", password: "password1" });
		expect(status).toEqual(401);
		expect(body).length(1);
		expect(body).toContain("Incorrect password");
	});
	test("Responds with HTTP status 200 if the password and username provided match their respective values in the database.", async () => {
		const sessionApp = express();
		sessionApp.use(session({ secret: "secret-key" }));
		sessionApp.all("/login", (req, res, next) => {
			next();
		});
		sessionApp.use(testApp);
		const { status, body, headers } = await request(sessionApp)
			.post("/login")
			.send({ username: "testuser1", password: "password1!" });
		expect(status).toEqual(200);
		const dbUser = await prisma.user.findFirst();
		expect(body).toStrictEqual(dbUser);
		let cookies = headers["set-cookie"] as unknown as string[];
		cookies = cookies.map((cookie) => cookie.split("=")[0]);
		expect(cookies).toContain("user_id");
		expect(cookies).toContain("session_id");
	});
});
