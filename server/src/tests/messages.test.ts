import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDb } from "./resetDb";
import { registerExtension } from "../routes/register";
import prisma from "../../prisma/prismaClient";
import { testMessages } from "./fixtures/messages.fixtures";
import { testUser1, testUser2, testUser3 } from "./fixtures/users.fixtures";
import messages, { fetchMessages } from "../routes/messages";
import session from "express-session";
import request from "supertest";
import express from "express";
import { Message } from "@prisma/client";

describe("test message froms routes.", () => {
  vi.mock("./../middleware/authenticate", () => ({
    authenticate: vi.fn((req, _res, next) => {
      next();
    }),
  }));

  beforeEach(async () => {
    await resetDb();
    await prisma.$extends(registerExtension).user.create({ data: testUser1 });
    await prisma.$extends(registerExtension).user.create({ data: testUser2 });
    await prisma.$extends(registerExtension).user.create({ data: testUser3 });
    await prisma.message.createMany({ data: testMessages });
  });

  const testApp = express();
  testApp.use("/messages/:recipientId", express.json(), messages);
  const sessionApp = express();
  sessionApp.use(session({ secret: "secret-key" }));
  sessionApp.all("*", (req, res, next) => {
    req.session.user = { id: 1, username: "testuser1" };
    next();
  });
  sessionApp.use(testApp);

  describe("Test fetchMessages function which fetches relevant messages from the database and sorts them in chronological order.", async () => {
    test("Fetch messages between testuser1 and testuser2.", async () => {
      const messages = await fetchMessages(1, 2);
      expect(messages).length(3);
      expect(messages[0].text).toEqual(
        "test message from testuser1 to testuser2"
      );
      expect(messages[1].text).toEqual(
        "test message from testuser2 to testuser1"
      );
      expect(messages[2].text).toEqual(
        "Second test message from testuser1 to testuser2"
      );
    });
    test("Fetch messages between testuser1 and testuser3.", async () => {
      const messages = await fetchMessages(1, 3);
      expect(messages[0].text).toEqual(
        "test message from testuser1 to testuser3"
      );
      expect(messages[1].text).toEqual(
        "test message from testuser3 to testuser1"
      );
      expect(messages[2].text).toEqual(
        "Second test message from testuser3 to testuser1"
      );
      expect(messages[3].text).toEqual(
        "Third test message from testuser3 to testuser1"
      );
    });
    test("Fetch messages between testuser2 and testuser3.", async () => {
      const messages = await fetchMessages(2, 3);
      expect(messages).length(4);
      expect(messages[0].text).toEqual(
        "test message from testuser2 to testuser3"
      );
      expect(messages[1].text).toEqual(
        "test message from testuser3 to testuser2"
      );
      expect(messages[2].text).toEqual(
        "Second test message from testuser2 to testuser3"
      );
      expect(messages[3].text).toEqual(
        "Second test message from testuser3 to testuser2"
      );
    });
  });

  describe("Fetch messages at route: [GET] /messages.", async () => {
    test("Responds with HTTP status 200 and all messages between the session user (testuser1) and the user with ID provided as a parameter.", async () => {
      const request1 = await request(sessionApp).get("/messages/2");
      expect(request1.status).toEqual(200);
      expect(request1.body).length(3);
      expect([request1.body[0].senderId, request1.body[0].recipientId]).toEqual(
        [1, 2]
      );
      expect([request1.body[1].senderId, request1.body[1].recipientId]).toEqual(
        [2, 1]
      );
      expect([request1.body[0].senderId, request1.body[0].recipientId]).toEqual(
        [1, 2]
      );

      const request2 = await request(sessionApp).get("/messages/3");
      expect(request2.status).toEqual(200);
      expect(request2.body).length(4);
      expect([request2.body[0].senderId, request2.body[0].recipientId]).toEqual(
        [1, 3]
      );
      expect([request2.body[1].senderId, request2.body[1].recipientId]).toEqual(
        [3, 1]
      );
      expect([request2.body[2].senderId, request2.body[2].recipientId]).toEqual(
        [3, 1]
      );
      expect([request2.body[3].senderId, request2.body[3].recipientId]).toEqual(
        [3, 1]
      );

      const request3 = await request(sessionApp).get("/messages/1");
      expect(request3.status).toEqual(200);
      expect(request3.body).length(0);
    });
    test("Responds with HTTP status 404 when a recipient ID is provided with no corresponding user in the database.", async () => {
      const { status, text } = await request(sessionApp).get("/messages/4");
      expect(status).toEqual(404);
      expect(text).toEqual("No User found with ID provided.");
    });
    test("Responds with HTTP status 400 when an invalid recipient ID is provided as a parameter.", async () => {
      const { status, text } = await request(sessionApp).get("/messages/3a");
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid recipient ID provided - must be a number.");
    });
  });

  describe("Send a new message at route: [POST] /messages.", async () => {
    test("Responds with HTTP status 201 and relevant messages when a new message is sent.", async () => {
      const { status, body } = await request(sessionApp)
        .post("/messages/2")
        .send({ text: "New test message from from testuser1 to testuser2" });
      expect(status).toEqual(201);
      expect(body).length(4);
      expect([
        body[3].senderUsername,
        body[3].recipientUsername,
        body[3].text,
      ]).toEqual([
        "testuser1",
        "testuser2",
        "New test message from from testuser1 to testuser2",
      ]);
    });
    test("Responds with HTTP status 400 if message validation fails - message too short.", async () => {
      const { status, text } = await request(sessionApp)
        .post("/messages/2")
        .send({ text: "" });
      expect(status).toEqual(400);
      expect(text).toEqual("Message cannot be empty!");
    });
    test("Responds with HTTP status 400 if message validation fails - text parameter missing.", async () => {
      const { status, text } = await request(sessionApp).post("/messages/2");
      expect(status).toEqual(400);
      expect(text).toEqual("Message not provided.");
    });
    test("Responds with HTTP status 400 when an invalid recipient ID is provided.", async () => {
      const { status, text } = await request(sessionApp).post("/messages/2a");
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid recipient ID provided - must be a number.");
    });
    test("Responds with HTTP status 404 when a user ID is provided with no corresponding user in the database.", async () => {
      const { status, text } = await request(sessionApp).post("/messages/4");
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
        .post("/messages/2")
        .send({ text: "new test message" });
      expect(status).toEqual(500);
      expect(text).toEqual("An unexpected error occured.");
    });
  });

  describe("deletes an existing message at route: [DELETE] /messages.", async () => {
    test("Responds with HTTP status 200 and all relevant messages when a message is deleted.", async () => {
      const { status, body } = await request(sessionApp).delete(
        "/messages/2/message/1"
      );
      expect(status).toEqual(200);
      expect(body).length(2);
      expect(body.map((message: Message) => message.id)).not.toContain(1);
    });
    test("Responds with HTTP status 400 when an invalid recipient ID is provided.", async () => {
      const { status, text } = await request(sessionApp).delete(
        "/messages/2a//message/1"
      );
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid recipient ID provided - must be a number.");
    });
    test("Responds with HTTP status 400 when an invalid message ID is provided.", async () => {
      const { status, text } = await request(sessionApp).delete(
        "/messages/2//message/1a"
      );
      expect(status).toEqual(400);
      expect(text).toEqual("Invalid message ID provided - must be a number.");
    });
    test("Responds with HTTP status 404 if the recipient ID provided does not correspond to a user in the database.", async () => {
      const { status, text } = await request(sessionApp).delete(
        "/messages/4/message/1"
      );
      expect(status).toEqual(404);
      expect(text).toEqual("No User found with ID provided.");
    });
    test("Responds with HTTP status 404 if the message ID provided does not correspond to a message in the database.", async () => {
      const { status, text } = await request(sessionApp).delete(
        "/messages/2/message/12"
      );
      expect(status).toEqual(404);
      expect(text).toEqual("No Message found with ID provided.");
    });
    test("Responds with HTTP status 403 if message's sender ID does not match the session's userID (trying to delete someone else's message).", async () => {
      const { status, text } = await request(sessionApp).delete(
        "/messages/2/message/4"
      );
      expect(status).toEqual(403);
      expect(text).toEqual("Cannot delete someone else's message.");
    });
  });
});
