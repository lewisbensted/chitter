import { beforeEach, expect, test, describe } from "vitest";
import prisma from "../client";
import { resetDb } from "./reset-db";
import request from "supertest";
import express from "express";
import register from "../routes/register";


describe("Register a new user at route: [POST] /register.", async () => {
	beforeEach(async () => {
		await resetDb();
	});
	const app = express();
	app.use("/register", express.json(), register);
	test("Should respond with a 201 code and new user information when a user is succesfully created.", async () => {
		const testUser = {
			email: "testuser1@gmail.com",
			firstName: "test",
			lastName: "user",
			password: "password1!",
			username: "testuser1"
		};
		const { status, body } = await request(app).post("/register").send(testUser);
		const newUser = await prisma.user.findFirst();
		expect(status).toEqual(201);
		expect(newUser).not.toBeNull();
		expect(newUser).toStrictEqual(body);
	});
	test("Should respond with a 400 status code if a user already exists with the provided username.", async () => {
		const testUser1 = {
			email: "testuser1@gmail.com",
			firstName: "test",
			lastName: "user",
			password: "password1!",
			username: "testuser1"
		};
		const testUser2 = {
			email: "testuser2@gmail.com",
			firstName: "test",
			lastName: "user",
			password: "password2!",
			username: "testuser1"
		};
		await prisma.user.create({ data: testUser1 });
		const { status, body } = await request(app).post("/register").send(testUser2);
		const count = await prisma.user.count();
		expect(status).toEqual(400);
		expect(count).toEqual(1);
		expect(body).length(1);
		expect(body[0]).toEqual("Username already taken.");
	});
	test("Should respond with a 400 status code if a user already exists with the provided email address.", async () => {
		const testUser1 = {
			email: "testuser1@gmail.com",
			firstName: "test",
			lastName: "user",
			password: "password1!",
			username: "testuser1"
		};
		const testUser2 = {
			email: "testuser1@gmail.com",
			firstName: "test",
			lastName: "user",
			password: "password2!",
			username: "testuser2"
		};
		await prisma.user.create({ data: testUser1 });
		const { status, body } = await request(app).post("/register").send(testUser2);
		const count = await prisma.user.count();
		expect(status).toEqual(400);
		expect(count).toEqual(1);
		expect(body.length).toEqual(1);
		expect(body[0]).toEqual("Email address already taken.");
	});
	test("Should respond with a 400 status code if the request body is missing a field.", async () => {
		const testUser1 = {
			email: "testuser1@gmail.com",
			lastName: "user",
			password: "password1!",
			username: "testuser1"
		};
		const { status, body } = await request(app).post("/register").send(testUser1);
		const count = await prisma.user.count();
		expect(status).toEqual(400);
		expect(count).toEqual(0);
		expect(body.length).toEqual(1);
		expect(body[0]).toEqual("Required");
	});
});
