import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./routes/register.js";
import login from "./routes/login.js";
import validate from "./routes/validate.js";
import cheets from "./routes/cheets.js";
import replies from "./routes/replies.js";
import logout from "./routes/logout.js";
import type { ExtendedPrismaClient } from "../prisma/prismaClient.js";
import messages from "./routes/messages.js";
import path from "path";
import cors from "cors";
import conversations from "./routes/conversations.js";
import users from "./routes/users.js";
import { rateLimiter } from "./middleware/rateLimiting.js";
import follow from "./routes/follow.js";
import MySQLStoreImport from "express-mysql-session";
import { errorHandler } from "./middleware/errorHandling.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { DATABASE_URL, ENVIRONMENT, FRONTEND_PORT, PROJECT_ROOT } from "../../config.js";

const envPath = `../.env.${ENVIRONMENT ?? "development"}`;
dotenvExpand.expand(dotenv.config({ path: envPath }));

const MySQLStore = MySQLStoreImport(session);

const dbUrl = new URL(DATABASE_URL!);

const storeOptions = {
	user: dbUrl.username,
	password: dbUrl.password,
	database: dbUrl.pathname.slice(1),
	host: dbUrl.hostname,
	port: Number(dbUrl.port) || 3306,
	expiration: 86400,
	schema: { tableName: "session_store" },
};

const sessionStore = new MySQLStore(storeOptions);

export const createApp = (prisma: ExtendedPrismaClient) => {
	const app = express();

	app.use(cookieParser());
	app.use(
		session({
			secret: "secret-key",
			name: "session",
			saveUninitialized: false,
			resave: false,
			store: sessionStore,
		})
	);

	if (ENVIRONMENT === "development") {
		app.use(
			cors({
				origin: `http://localhost:${FRONTEND_PORT}`,
				credentials: true,
			})
		);
	}

	if (ENVIRONMENT === "test") {
		app.use((req, _res, next) => {
			if (!req.session.user && req.headers["session-required"]) {
				req.session.user = { uuid: "sessionuserid" };
				req.cookies = { user_id: "sessionuserid" };
			}
			next();
		});
	}

	const authLimiter = rateLimiter(1000 * 60, 5);
	const generalLimiter = rateLimiter(1000 * 60 * 10, 1000);

	app.use(express.json());

	app.use("/api/users", generalLimiter, users(prisma));
	app.use("/api/follow/:followingId", generalLimiter, follow(prisma));
	app.use("/api/register", authLimiter, register(prisma));
	app.use("/api/login", authLimiter, login(prisma));
	app.use("/api/validate", generalLimiter, validate());
	app.use("/api/logout", generalLimiter, logout());
	app.use("/api/cheets", generalLimiter, cheets(prisma));
	app.use("/api/conversations", generalLimiter, conversations(prisma));
	app.use("/api/users/:userId/cheets", generalLimiter, cheets(prisma));
	app.use("/api/cheets/:cheetId/replies", generalLimiter, replies(prisma));
	app.use("/api/replies", generalLimiter, replies(prisma));
	app.use("/api/messages", generalLimiter, messages(prisma));

	app.all("/api/*", (_req, res) => {
		res.status(404).json({ errors: ["Route not found."], code: "ROUTE_NOT_FOUND" });
	});

	if (ENVIRONMENT === "production") {
		const buildPath = path.join(PROJECT_ROOT, "frontend", "dist");
		app.use(express.static(buildPath));
		app.get("*", (_req, res) => {
			res.sendFile(path.join(buildPath, "index.html"));
		});
	}

	app.use(errorHandler);

	return app;
};
