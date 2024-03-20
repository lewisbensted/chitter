import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./routes/register.js";
import { config } from "dotenv";
import users from "./routes/users.js";
import login from "./routes/login.js";
import validate from "./routes/validate.js";
import cheets from "./routes/cheets.js";
import replies from "./routes/replies.js";
import logout from "./routes/logout.js";
import { logErrors } from "./utils/logErrors.js";
import prisma from "./client.js";

config({ path: `.env.${process.env.NODE_ENV}` });

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
		app.use("/validate", validate);
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

