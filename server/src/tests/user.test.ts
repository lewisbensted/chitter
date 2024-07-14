// import { beforeEach, describe, expect, test } from "vitest";
// import { resetDB } from "./resetDB";
// import { testUser1 } from "./fixtures/users.fixtures";
// import { registerExtension } from "../routes/register";
// import prisma from "../../prisma/prismaClient";
// import express from "express";
// import request from "supertest";
// import user from "../routes/user";

// describe("Fetch a specific username at route: [POST] /users.", async () => {
//   beforeEach(async () => {
//     await resetDB();
//     await prisma.$extends(registerExtension).user.create({ data: testUser1 });
//   });
//   const testApp = express();
//   testApp.use("/users/:userId", user);

//   test("Responds with HTTP status 200 and username specific to the request parameter.", async () => {
//     const { status, text } = await request(testApp).post("/users/1");
//     expect(status).toEqual(200);
//     expect(text).toEqual("testuser1");
//   });
//   test("Responds with HTTP status 404 if the user does not exist in the database.", async () => {
//     const { status, text } = await request(testApp).post("/users/2");
//     expect(status).toEqual(404);
//     expect(text).toEqual("User not found");
//   });
// });
