import z from "zod";
import { userIdSchema } from "./user";

export const threadIdSchema = z.uuid().brand("thread");
export type ThreadId = z.infer<typeof threadIdSchema>;
export const threadSchema = z.object({
  id: threadIdSchema,
  administratorId: userIdSchema.nullable(),
  participantsId: userIdSchema.array(),
  title: z.string(),
  createdAt: z.iso.datetime(),
  type: z.enum(["external", "internal"]),
  updatedAt: z.iso.datetime(),
});

export type Thread = z.infer<typeof threadIdSchema>;
