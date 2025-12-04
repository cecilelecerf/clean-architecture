import z from "zod";
<<<<<<< HEAD
import { userDtoSchema, userIdSchema } from "./user";
=======
import { userIdSchema } from "./user";
>>>>>>> 2ce9cab (thread)
import { threadIdSchema } from "./thread";

export const messageIdSchema = z.uuid().brand("message");
export type MessageId = z.infer<typeof messageIdSchema>;
export const messageSchema = z.object({
  id: messageIdSchema,
  threadId: threadIdSchema,
  senderId: userIdSchema,
  content: z.string(),
  sentAt: z.iso.datetime(),
  readBy: userIdSchema.array(),
});
<<<<<<< HEAD

export type Message = z.infer<typeof messageSchema>;

export const messageWithUserSchema = messageSchema.extend({
  sender: userDtoSchema,
});
export type MessageWithUser = z.infer<typeof messageWithUserSchema>;
=======
>>>>>>> 2ce9cab (thread)
