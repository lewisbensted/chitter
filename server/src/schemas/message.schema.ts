import { z } from "zod";

export const CreateMessageSchema = z.object({
    id: z.number().optional(),
    senderId: z.number({ required_error: "Sender ID not provided." }),
    senderUsername: z.string({ required_error: "Sender username not provided." }),
    recipientId: z.number({ required_error: "Recipient ID not provided." }),
    recipientUsername: z.string({ required_error: "Recipient username not provided." }),
    text: z
        .string({ required_error: "Message not provided." })
        .min(1, "Message cannot be empty!")
        .max(50, "Message can be at most 50 characters."),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const UpdateMessageSchema = z.object({
    text: z
        .string({ required_error: "Message not provided." })
        .min(1, "Message cannot be empty!")
        .max(50, "Message can be at most 50 characters."),
    updatedAt: z.date(),
});
