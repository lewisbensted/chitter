import express from "express";
import register from "./controllers/register.js";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: `.env.${process.env.NODE_ENV}` });

const prisma = new PrismaClient();

// prisma.$connect().then(() => {
	const app = express();
	const PORT = process.env.PORT || 4000;

	app.use("/register", express.json(), register);

	app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));




// }).catch(e => {

// 	console.log(e.message)
// })

