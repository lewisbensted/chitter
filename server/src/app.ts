import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./controllers/register.js";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import users from "./controllers/users.js";
import login from "./controllers/login.js";

config({ path: `.env.${process.env.NODE_ENV}` });

const prisma = new PrismaClient();

prisma.$connect().then(() => {
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
	// app.use("/validate", validateLoggedIn);
	// app.use("/logout", logout);
	app.use("/users/:userId", users);
	// app.use("/cheets", express.json(), cheets);
	// app.use("/users/:userId/cheets", express.json(), cheets);
	// app.use("/cheets/:cheetId/replies", replies);

	app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));

}).catch((error:unknown) => {
	console.error(
		"Error initialising database connection:\n" +
		(error instanceof PrismaClientInitializationError ?
			error.message.replace(/\n\n/g, "\n") : "An unknown error has occured."));
});

