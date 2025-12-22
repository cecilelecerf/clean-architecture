import z from "zod";
import { userDtoSchema, userIdSchema } from "./user";
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

export type Message = z.infer<typeof messageSchema>;

export const messageWithUserSchema = messageSchema.extend({
  sender: userDtoSchema,
});
export type MessageWithUserDTO = z.infer<typeof messageWithUserSchema>;
