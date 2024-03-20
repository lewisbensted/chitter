import express from "express";
import { test, describe, vi, expect } from "vitest";
import validate from "../routes/validate";
import request from "supertest";
import session from "express-session";
import { authenticate } from "../middleware/authenticate";

describe("Return information about the session's user at route: [GET] /validate.", async () => {
	vi.mock("./../middleware/authenticate", () => ({
		authenticate: vi.fn((req, res, next) => {
			req.session.user = { id: 1, username: "testuser" };
			next();
		})
	}));

	const app = express();
	app.use(
		session({
			secret: "secret-key"
		})
	);
	app.use("/validate", express.json(), validate);

	test("Successful request returns session's user information.", async () => {
		const { status, body } = await request(app).get("/validate");
		expect(authenticate).toHaveBeenCalledTimes(1);
		expect(status).toEqual(200);
		expect(body).toStrictEqual({ id: 1, username: "testuser" });
	});
});
