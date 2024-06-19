import express from "express";
import session, * as expressSession from "express-session";
import cookieParser from "cookie-parser";
import register from "./routes/register.js";
import user from "./routes/user.js";
import login from "./routes/login.js";
import validate from "./routes/validate.js";
import cheets from "./routes/cheets.js";
import replies from "./routes/replies.js";
import logout from "./routes/logout.js";
import { logError } from "./utils/logError.js";
import prisma from "../prisma/prismaClient.js";
import messages from "./routes/messages.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import MySQLStore from "express-mysql-session";

dotenvExpand.expand(dotenv.config({ path: `../.env.${process.env.NODE_ENV}` }));
const SessionStore = MySQLStore(expressSession);

const sessionStoreOptions: MySQLStore.Options = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  expiration: 86400,
  schema: { tableName: "session_store" },
};

prisma
  .$connect()
  .then(() => {
    const app = express();
    const PORT = Number(process.env.SERVER_PORT);

    app.use(cookieParser());
    app.use(
      session({
        secret: "secret-key",
        saveUninitialized: false,
        resave: false,
        store: new SessionStore(sessionStoreOptions),
      })
    );

    app.use("/register", express.json(), register);
    app.use("/login", express.json(), login);
    app.use("/validate", validate);
    app.use("/logout", logout);
    app.use("/users/:userId", user);
    app.use("/cheets", express.json(), cheets);
    app.use("/users/:userId/cheets", express.json(), cheets);
    app.use("/cheets/:cheetId/replies", replies);
    app.use("/messages/:recipientId", express.json(), messages);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
  })
  .catch((error: unknown) => {
    console.error(
      error instanceof RangeError
        ? `Invalid server port provided - must be a number between 0 and 65536. \nRecieved: ${
            process.env.SERVER_PORT
          }, 
			type: ${
        process.env.SERVER_PORT === undefined
          ? undefined
          : Number.isNaN(Number(process.env.SERVER_PORT))
          ? "string"
          : "number"
      }.`
        : "Error initialising database connection:\n" + logError(error)
    );
  });
