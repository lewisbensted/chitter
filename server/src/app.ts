import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./controllers/register.js";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import users from "./controllers/users.js";
import login from "./controllers/login.js";
import validateLoggedIn from "./controllers/validateLoggedIn.js";
import cheets from "./controllers/cheets.js";
import replies from "./controllers/replies.js";
import logout from "./controllers/logout.js";
import { logErrors } from "./utils/logErrors.js";

config({ path: `.env.${process.env.NODE_ENV}` });

const prisma = new PrismaClient();

prisma
	.$connect()
	.then(() => {
		const app = express();
		const PORT = process.env.PORT || 4000;

		app.use(cookieParser());
		app.use(
			session({
				secret: "secret-key",
				saveUninitialized: false,
				resave: false
			})
		);

		app.use("/register", express.json(), register);
		app.use("/login", express.json(), login);
		app.use("/validate", validateLoggedIn);
		app.use("/logout", logout);
		app.use("/users/:userId", users);
		app.use("/cheets", express.json(), cheets);
		app.use("/users/:userId/cheets", express.json(), cheets);
		app.use("/cheets/:cheetId/replies", replies);

		app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
	})
	.catch((error) => {
		console.error(
			"Error initialising database connection:\n" +
				logErrors(error)
		);
	});
