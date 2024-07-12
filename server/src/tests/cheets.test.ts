import { beforeEach, test, describe, vi, expect } from "vitest";
import prisma from "../../prisma/prismaClient";
import { registerExtension } from "../routes/register";
import { resetDB } from "./resetDB";
import { testUser1, testUser2 } from "./fixtures/users.fixtures";
import cheets, { fetchCheets } from "../routes/cheets";
import { testCheets } from "./fixtures/cheets.fixtures";
import express from "express";
import request from "supertest";
import { Cheet } from "@prisma/client";
import session from "express-session";

describe("Test cheets routes.", () => {
  vi.mock("./../middleware/authenticate", () => ({
    authenticate: vi.fn((req, _res, next) => {
      next();
    }),
  }));

  beforeEach(async () => {
    await resetDB();
    await prisma.$extends(registerExtension).user.create({ data: testUser1 });
    await prisma.$extends(registerExtension).user.create({ data: testUser2 });
    await prisma.cheet.createMany({ data: testCheets });
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

  describe("Test fetchCheets function which fetches relevant cheets from the database and sorts them in chronological order.", async () => {
    test("No user ID provided as a parameter.", async () => {
      const cheets = await fetchCheets();
      expect(cheets).length(5);
      expect([cheets[0].username, cheets[0].text]).toEqual([
        "testuser1",
        "test cheet 3",
      ]);
      expect([cheets[1].username, cheets[1].text]).toEqual([
        "testuser1",
        "test cheet 4",
      ]);
      expect([cheets[2].username, cheets[2].text]).toEqual([
        "testuser2",
        "test cheet 2",
      ]);
      expect([cheets[3].username, cheets[3].text]).toEqual([
        "testuser2",
        "test cheet 5",
      ]);
      expect([cheets[4].username, cheets[4].text]).toEqual([
        "testuser1",
        "test cheet 1",
      ]);
    });
    test("User ID provided as a parameter.", async () => {
      const cheets = await fetchCheets(1);
      expect(cheets).length(3);
      expect([cheets[0].username, cheets[0].text]).toEqual([
        "testuser1",
        "test cheet 3",
      ]);
      expect([cheets[1].username, cheets[1].text]).toEqual([
        "testuser1",
        "test cheet 4",
      ]);
      expect([cheets[2].username, cheets[2].text]).toEqual([
        "testuser1",
        "test cheet 1",
      ]);
    });
  });

  describe("Fetch cheets at route: [GET] /cheets.", async () => {
    test("Responds with HTTP status 200 and all cheets when a user ID is not provided as a parameter.", async () => {
      const { status, body } = await request(sessionApp).get("/cheets");
      expect(status).toEqual(200);
      expect(body).length(5);
    });
    test("Responds with HTTP status 200 and cheets relevant to a particular user when a user ID is provided as a parameter.", async () => {
      const request1 = await request(sessionApp).get("/users/1/cheets");
      expect(request1.status).toEqual(200);
      expect(request1.body).length(3);
      expect(request1.body[0].userId).toEqual(1);
      expect(request1.body[1].userId).toEqual(1);
      expect(request1.body[2].userId).toEqual(1);

      const request2 = await request(sessionApp).get("/users/2/cheets");
      expect(request2.status).toEqual(200);
      expect(request2.body).length(2);
      expect(request2.body[0].userId).toEqual(2);
      expect(request2.body[1].userId).toEqual(2);
    });
    test("Responds with HTTP status 400 when an invalid user ID is provided.", async () => {
      const { status, text } = await request(sessionApp).get(
        "/users/1a/cheets"
      );
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid user ID provided - must be a number.");
    });
    test("Responds with HTTP status 404 when a user ID is provided with no corresponding user in the database.", async () => {
      const { status, text } = await request(sessionApp).get("/users/3/cheets");
      expect(status).toEqual(404);
      expect(text).toEqual("No User found with ID provided.");
    });
  });

  describe("Post a new cheet at route: [POST] /cheets.", async () => {
    test("Responds with HTTP status 201 and all cheets when a new cheet is created without a user ID parameter.", async () => {
      const { status, body } = await request(sessionApp)
        .post("/cheets")
        .send({ text: "new test cheet" });
      expect(status).toEqual(201);
      expect(body).length(6);
      expect([body[5].username, body[5].text]).toEqual([
        "testuser1",
        "new test cheet",
      ]);
    });
    test("Responds with HTTP status 201 and relevant cheets when a new cheet is created with a user ID parameter.", async () => {
      const request1 = await request(sessionApp)
        .post("/users/1/cheets")
        .send({ text: "new test cheet" });
      expect(request1.status).toEqual(201);
      expect(request1.body).length(4);
      expect([request1.body[3].username, request1.body[3].text]).toEqual([
        "testuser1",
        "new test cheet",
      ]);

      const request2 = await request(sessionApp)
        .post("/users/2/cheets")
        .send({ text: "new test cheet" });
      expect(request2.status).toEqual(201);
      expect(request2.body).length(2);
      expect(
        request2.body.map((cheet: { text: string }) => cheet.text)
      ).not.toContain("new test cheet");
    });
    test("Responds with HTTP status 400 if cheet validation fails - cheet too short.", async () => {
      const { status, text } = await request(sessionApp)
        .post("/cheets")
        .send({ text: "test" });
      expect(status).toEqual(400);
      expect(text).toEqual(
        "Cheet too short - must be between 5 and 50 characters."
      );
    });
    test("Responds with HTTP status 400 if cheet validation fails - text parameter missing.", async () => {
      const { status, text } = await request(sessionApp).post("/cheets");
      expect(status).toEqual(400);
      expect(text).toEqual("Text not provided.");
    });
    test("Responds with HTTP status 400 when an invalid user ID is provided.", async () => {
      const { status, text } = await request(sessionApp).post(
        "/users/1a/cheets"
      );
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid user ID provided - must be a number.");
    });
    test("Responds with HTTP status 404 when a user ID is provided with no corresponding user in the database.", async () => {
      const { status, text } = await request(sessionApp).post(
        "/users/3/cheets"
      );
      expect(status).toEqual(404);
      expect(text).toEqual("No User found with ID provided.");
    });
    test("Responds with HTTP status 500 if the session user ID and username do not match the composite key in the users table.", async () => {
      const sessionAppIncorrect = express();
      sessionAppIncorrect.use(session({ secret: "secret-key" }));
      sessionAppIncorrect.all("*", (req, res, next) => {
        req.session.user = { id: 1, username: "testuser2" };
        next();
      });
      sessionAppIncorrect.use(testApp);
      const { status, text } = await request(sessionAppIncorrect)
        .post("/cheets")
        .send({ text: "new test cheet" });
      expect(status).toEqual(500);
      expect(text).toEqual("An unexpected error occured.");
    });
  });

  describe("Updates an existing cheet at route: [PUT] /cheets.", async () => {
    test("Responds with HTTP status 200 and all cheets when an existing cheet is updated without a user ID parameter.", async () => {
      const { status, body } = await request(sessionApp)
        .put("/cheets/1")
        .send({ text: "test cheet 1 - updated" });
      expect(status).toEqual(200);
      expect(body).length(5);
      const updatedCheet = body.filter((cheet: Cheet) => cheet.id == 1);
      expect(updatedCheet).length(1);
      expect(updatedCheet[0].text).toEqual("test cheet 1 - updated");
      expect(updatedCheet[0].updatedAt > updatedCheet[0].createdAt).toBe(true);
    });
    test("Responds with HTTP status 200 and relevant cheets when an existing cheet is updated with a user ID parameter.", async () => {
      const request1 = await request(sessionApp)
        .put("/users/1/cheets/1")
        .send({ text: "test cheet 1 - updated" });
      expect(request1.status).toEqual(200);
      expect(request1.body).length(3);
      const updatedCheet1 = request1.body.filter(
        (cheet: Cheet) => cheet.id == 1
      );
      expect(updatedCheet1).length(1);
      expect(updatedCheet1[0].text).toEqual("test cheet 1 - updated");

      const request2 = await request(sessionApp)
        .put("/users/2/cheets/1")
        .send({ text: "test cheet 1 - updated again" });
      expect(request2.status).toEqual(200);
      expect(request2.body).length(2);
      const updatedCheet2 = request2.body.filter(
        (cheet: Cheet) => cheet.id == 1
      );
      expect(updatedCheet2).length(0);
    });
    test("Responds with HTTP status 400 if cheet validation fails - cheet too short.", async () => {
      const { status, text } = await request(sessionApp)
        .put("/cheets/1")
        .send({ text: "test" });
      expect(status).toEqual(400);
      expect(text).toEqual(
        "Cheet too short - must be between 5 and 50 characters."
      );
    });
    test("Responds with HTTP status 400 if cheet validation fails - text parameter missing.", async () => {
      const { status, text } = await request(sessionApp).put("/cheets/1");
      expect(status).toEqual(400);
      expect(text).toEqual("Text not provided.");
    });
    test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to update someone else's cheet).", async () => {
      const { status, text } = await request(sessionApp)
        .put("/cheets/2")
        .send({ text: "testuser2: test cheet 1 - updated" });
      expect(status).toEqual(403);
      expect(text).toEqual("Cannot update someone else's cheet.");
    });
    test("Responds with HTTP status 404 if the user ID provided does not correspond to a user in the database.", async () => {
      const { status, text } = await request(sessionApp)
        .put("/users/3/cheets/1")
        .send({ text: "update cheet nonexistent user" });
      expect(status).toEqual(404);
      expect(text).toEqual("No User found with ID provided.");
    });
    test("Responds with HTTP status 404 if the cheet to be updated does not exist in the database.", async () => {
      const { status, text } = await request(sessionApp)
        .put("/cheets/6")
        .send({ text: "update nonexistent cheet" });
      expect(status).toEqual(404);
      expect(text).toEqual("No Cheet found with ID provided.");
    });
    test("Responds with HTTP status 400 when an invalid user ID is provided.", async () => {
      const { status, text } = await request(sessionApp)
        .put("/users/1a/cheets/1")
        .send({ text: "update cheet invalid user" });
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid user ID provided - must be a number.");
    });
    test("Responds with HTTP status 400 when an invalid cheet ID is provided.", async () => {
      const { status, text } = await request(sessionApp)
        .put("/cheets/1a")
        .send({ text: "update invalid cheet" });
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid cheet ID provided - must be a number.");
    });
    test("Responds with HTTP status 500 if the session user ID and username do not match the composite key in the users table.", async () => {
      const sessionAppIncorrect = express();
      sessionAppIncorrect.use(session({ secret: "secret-key" }));
      sessionAppIncorrect.all("*", (req, res, next) => {
        req.session.user = { id: 1, username: "testuser2" };
        next();
      });
      sessionAppIncorrect.use(testApp);
      const { status, text } = await request(sessionAppIncorrect)
        .put("/users/1/cheets/1")
        .send({ text: "test cheet 1 - updated" });
      expect(status).toEqual(500);
      expect(text).toEqual("An unexpected error occured.");
    });

    describe("Deletes an existing cheet at route: [DELETE] /cheets.", async () => {
      test("Responds with HTTP status 200 and all cheets when an existing cheet is deleted without a user ID parameter.", async () => {
        const { status, body } = await request(sessionApp).delete("/cheets/1");
        expect(status).toEqual(200);
        expect(body).length(4);
        expect(body.map((cheet: Cheet) => cheet.id)).not.toContain(1);
      });
      test("Responds with HTTP status 200 and relevant cheets when an existing cheet is deleted with a user ID parameter.", async () => {
        const request1 = await request(sessionApp).delete("/users/1/cheets/1");
        expect(request1.status).toEqual(200);
        expect(request1.body).length(2);
        const deletedCheet1 = request1.body.filter(
          (cheet: Cheet) => cheet.id == 1
        );
        expect(deletedCheet1).length(0);

        const request2 = await request(sessionApp).delete("/users/2/cheets/3");
        expect(request2.status).toEqual(200);
        expect(request2.body).length(2);
        const deletedCheet2 = request2.body.filter(
          (cheet: Cheet) => cheet.id == 3
        );
        expect(deletedCheet2).length(0);
      });
      test("Responds with HTTP status 400 when an invalid user ID is provided.", async () => {
        const { status, text } = await request(sessionApp).delete(
          "/users/1a/cheets/1"
        );
        expect(status).toEqual(400);
        expect(text).toEqual("Invalid user ID provided - must be a number.");
      });
      test("Responds with HTTP status 400 when an invalid cheet ID is provided.", async () => {
        const { status, text } = await request(sessionApp).delete("/cheets/1a");
        expect(status).toEqual(400);
        expect(text).toEqual("Invalid cheet ID provided - must be a number.");
      });
      test("Responds with HTTP status 404 if the user ID provided does not correspond to a user in the database.", async () => {
        const { status, text } = await request(sessionApp).delete(
          "/users/3/cheets/1"
        );
        expect(status).toEqual(404);
        expect(text).toEqual("No User found with ID provided.");
      });
      test("Responds with HTTP status 404 if the cheet to be deleted does not exist in the database.", async () => {
        const { status, text } = await request(sessionApp).delete("/cheets/6");
        expect(status).toEqual(404);
        expect(text).toEqual("No Cheet found with ID provided.");
      });
      test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to delete someone else's cheet).", async () => {
        const { status, text } = await request(sessionApp).delete("/cheets/2");
        expect(status).toEqual(403);
        expect(text).toEqual("Cannot delete someone else's cheet.");
      });
    });
  });
});
