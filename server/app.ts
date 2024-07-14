import express from "express";
import session, * as expressSession from "express-session";
import cookieParser from "cookie-parser";
import register from "./src/routes/register.js";
import login from "./src/routes/login.js";
import validate from "./src/routes/validate.js";
import cheets from "./src/routes/cheets.js";
import replies from "./src/routes/replies.js";
import logout from "./src/routes/logout.js";
import { logError } from "./src/utils/logError.js";
import prisma from "./prisma/prismaClient.js";
import messages from "./src/routes/messages.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import MySQLStore from "express-mysql-session";
import path from "path";
import cors from "cors";

dotenvExpand.expand(dotenv.config({ path: `../.env.${process.env.NODE_ENV}` }));
const SessionStore = MySQLStore(expressSession);
const __dirname = import.meta.dirname;

const sessionStoreOptions: MySQLStore.Options = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  expiration: 86400,
  schema: { tableName: "session_store" },
};

const checkValidPort = (port: number, side: string) => {
  if (Number.isNaN(port)) {
    throw new TypeError(
      `Invalid ${side} port provided - must be a number between 0 and 65536.`
    );
  } else if (port < 0 || port > 65535) {
    throw new RangeError(
      `Invalid ${side} port provided - must be a number between 0 and 65536.`
    );
  }
};

prisma
  .$connect()
  .then(() => {
    const app = express();
    const FRONTEND_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
    const SERVER_PORT = Number(process.env.SERVER_PORT);
    checkValidPort(Number(SERVER_PORT), "server");

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../frontend/build")));
      app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
      });
    } else {
      checkValidPort(Number(FRONTEND_PORT), "frontend");
      app.use(
        cors({
          origin: `http://localhost:${FRONTEND_PORT}`,
          credentials: true,
        })
      );
    }

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
    app.use("/cheets", express.json(), cheets);
    app.use("/users/:userId/cheets", express.json(), cheets);
    app.use("/cheets/:cheetId/replies", replies);
    app.use("/messages/:recipientId", express.json(), messages);
    app.listen(SERVER_PORT, () =>
      console.log(`Server running on port ${SERVER_PORT}.`)
    );
  })
  .catch((error: unknown) => {
    console.error(
      error instanceof TypeError || error instanceof RangeError
        ? error.message
        : "Error initialising database connection:\n" + logError(error)
    );
  });
