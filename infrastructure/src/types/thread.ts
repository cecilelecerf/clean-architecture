import z from "zod";
import { userDtoSchema, userIdSchema } from "./user";

export const messageIdSchema = z.uuid().brand("message");
export type MessageId = z.infer<typeof messageIdSchema>;

export const threadIdSchema = z.uuid().brand("thread");
export type ThreadId = z.infer<typeof threadIdSchema>;

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

export const threadSchema = z.object({
  id: threadIdSchema,
  administratorId: userIdSchema.nullable(),
  participantsId: userIdSchema.array(),
  title: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  type: z.enum(["external", "internal"]),
  isClose: z.boolean(),
});

export type Thread = z.infer<typeof threadSchema>;

export const newThreadSchema = threadSchema.pick({ title: true }).extend({
  participantsId: z.string().array(),
});

export type NewThread = z.infer<typeof newThreadSchema>;
export const newExternalThreadSchema = newThreadSchema.extend({
  messageContent: messageSchema.shape.content,
});
export type NewExternalThread = z.infer<typeof newExternalThreadSchema>;
