import { test, describe, vi, expect } from "vitest";
import { authenticate } from "../middleware/authenticate";
import { Request, Response, NextFunction } from "express";

describe("Authenticates the user by comparing information stored on the request's sessions and cookies.", async () => {
	test("Successful validation where the respective sessionIDs and userIDs match.", async () => {
		const req = {
			sessionID: "testID",
			session: { user: { id: 1234 } },
			cookies: { session_id: "testID", user_id: 1234 }
		} as unknown as Request;
		const res = { status: vi.fn(), send: vi.fn(() => res) } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authenticate(req, res, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
	test("Session IDs match but user does not exist on either the session or cookies.", async () => {
		const req = {
			sessionID: "testID",
			session: {},
			cookies: { session_id: "testID" }
		} as unknown as Request;
		const res = { status: vi.fn(() => res), send: vi.fn() } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authenticate(req, res, next);
		expect(next).toHaveBeenCalledTimes(0);
	});
	test("Session IDs match but userID does not exist in either the session or cookies.", async () => {
		const req = {
			sessionID: "testID",
			session: { user: {} },
			cookies: { session_id: "testID" }
		} as unknown as Request;
		const res = { status: vi.fn(() => res), send: vi.fn() } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authenticate(req, res, next);
		expect(next).toHaveBeenCalledTimes(0);
	});
	test("Session IDs match but userID's do not.", async () => {
		const req = {
			sessionID: "test_session_id",
			session: { user: { id: 200 } },
			cookies: { session_id: "test_session_id", user_id: 202 }
		} as unknown as Request;
		const res = { status: vi.fn(() => res), send: vi.fn() } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authenticate(req, res, next);
		expect(next).toHaveBeenCalledTimes(0);
	});
	test("User IDs match but sessionID's do not.", async () => {
		const req = {
			sessionID: "test_session_id",
			session: { user: { id: 200 } },
			cookies: { session_id: "test_session_id2", user_id: 200 }
		} as unknown as Request;
		const res = { status: vi.fn(() => res), send: vi.fn() } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authenticate(req, res, next);
		expect(next).toHaveBeenCalledTimes(0);
	});

	test("Neither User IDs nor sessionID's match.", async () => {
		const req = {
			sessionID: "test_session_id",
			session: { user: { id: 200 } },
			cookies: { session_id: "test_session_id2", user_id: 202 }
		} as unknown as Request;
		const res = { status: vi.fn(() => res), send: vi.fn() } as unknown as Response;
		const next = vi.fn() as unknown as NextFunction;

		authenticate(req, res, next);
		expect(next).toHaveBeenCalledTimes(0);
	});
});
