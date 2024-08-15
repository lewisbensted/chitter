import { z } from "zod";

export const LoginSchema = z.object({ 
    username: z.string({ required_error: "Username not provided." }),
    password: z.string({ required_error: "Password not provided." }),
});