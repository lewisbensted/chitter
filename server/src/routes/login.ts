import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { authenticate } from "../utils/authenticate.js";


const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        if (authenticate(req)) {
            res.status(403).send("Already logged in.");
        } else {
            const user = await prisma.user.findUnique({
                where: { username: username },
            });
            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    req.session.user = { id: user.id, username: username };
                    res.cookie("session_id", req.sessionID);
                    res.cookie("user_id", req.session.user.id);
                    res.status(200).send(user);
                } else {
                    res.status(401).send("Incorrect password.");
                }
            } else {
                res.status(404).send("User does not exist.");
            }
        }
    } catch (error) {
        console.error("Error loggin in:\n" + logError(error));
        res.status(500).send("An unexpected error occured.");
    }
});

export default router;
