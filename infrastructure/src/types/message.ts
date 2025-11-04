import z from "zod";
import { userIdSchema } from "./user";
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
