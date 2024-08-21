import { beforeEach, describe, expect, test, vi } from "vitest";
import prisma from "../../prisma/prismaClient";
import { registerExtension } from "../routes/register";
import { testUser1 } from "./fixtures/users.fixtures";
import { resetDB } from "./resetDB";
import express from "express";
import request from "supertest";
import user from "../routes/user";

describe("Test user route.", () => {
    vi.mock("./../middleware/authMiddleware", () => ({
        authMiddleware: vi.fn((req, _res, next) => {
            next();
        }),
    }));

    beforeEach(async () => {
        await resetDB();
        await prisma.$extends(registerExtension).user.create({ data: testUser1 });
    });

    const testApp = express();
    testApp.use("/users/:userId", user);

    test("Responds with HTTP status 200 and user when request successfull.", async () => {
        const { status, body } = await request(testApp).get("/users/1");
        expect(status).toEqual(200);
        expect(body.id).toEqual(1);
        expect(body.username).toEqual("testuser1");
    });

    test("Responds with HTTP status 400 when an invalid user ID is provided as a parameter.", async () => {
        const { status, text } = await request(testApp).get("/users/1a");
        expect(status).toEqual(400);
        expect(text).toEqual("Invalid user ID provided - must be a number.");
    });

    test("Responds with HTTP status 404 when the user ID provided does not match a user in the database.", async () => {
        const { status, text } = await request(testApp).get("/users/2");
        expect(status).toEqual(404);
        expect(text).toEqual("No User found with ID provided.");
    });
});
