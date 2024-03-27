import { beforeEach, expect, test, describe } from "vitest";
import prisma from "../prismaClient";
import { resetDb } from "./reset-db";
import request from "supertest";
import express from "express";
import register from "../routes/register";
import {
	testUser1,
	testUserDuplicateEmail,
	testUserDuplicateUsername,
	testUserMissingField,
	testUserMultipleFailures
} from "./fixtures/users.fixtures";

describe("Register a new user at route: [POST] /register.", async () => {
	beforeEach(async () => {
		await resetDb();
	});
	const testApp = express();
	testApp.use("/register", express.json(), register);
	test("Responds with HTTP status 201 and new user information when a user is succesfully created.", async () => {
		const { status, body } = await request(testApp).post("/register").send(testUser1);
		const newUser = await prisma.user.findFirst();
		expect(status).toEqual(201);
		expect(newUser).not.toBeNull();
		expect(newUser).toStrictEqual(body);
	});
	test("Responds with HTTP status 400 if a user already exists with the provided email address.", async () => {
		await prisma.user.create({ data: testUser1 });
		const { status, body } = await request(testApp).post("/register").send(testUserDuplicateEmail);
		const count = await prisma.user.count();
		expect(status).toEqual(400);
		expect(count).toEqual(1);
		expect(body.length).toEqual(1);
		expect(body).toContain("Email address already taken.");
	});
	test("Responds with HTTP status 400 if a user already exists with the provided username.", async () => {
		await prisma.user.create({ data: testUser1 });
		const { status, body } = await request(testApp).post("/register").send(testUserDuplicateUsername);
		const count = await prisma.user.count();
		expect(status).toEqual(400);
		expect(count).toEqual(1);
		expect(body).length(1);
		expect(body).toContain("Username already taken.");
	});
	test("Responds with HTTP status 400 if the request body is missing a field.", async () => {
		const { status, body } = await request(testApp).post("/register").send(testUserMissingField);
		const count = await prisma.user.count();
		expect(status).toEqual(400);
		expect(count).toEqual(0);
		expect(body.length).toEqual(1);
		expect(body).toContain("Last name not provided.");
	});
	test("Responds with HTTP status 400 if multiple validations fail at the same time.", async () => {
		await prisma.user.create({ data: testUser1 });
		const { status, body } = await request(testApp).post("/register").send(testUserMultipleFailures);
		expect(status).toEqual(400);
		expect(body.length).toEqual(4);
		expect(body).toContain("First name not provided.");
		expect(body).toContain("Username already taken.");
		expect(body).toContain("Invalid email address.");
		expect(body).toContain("Last name cannot contain spaces, numbers or special characters.");
	});
});
