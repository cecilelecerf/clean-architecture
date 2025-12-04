import z from "zod";
import { userIdSchema } from "./user";

export const threadIdSchema = z.uuid().brand("thread");
export type ThreadId = z.infer<typeof threadIdSchema>;
export const threadSchema = z.object({
  id: threadIdSchema,
<<<<<<< HEAD
  administratorId: userIdSchema.nullable(),
=======
  administrator: userIdSchema,
>>>>>>> 2ce9cab (thread)
  participantsId: userIdSchema.array(),
  title: z.string(),
  createdAt: z.iso.datetime(),
  type: z.enum(["external", "internal"]),
  updatedAt: z.iso.datetime(),
<<<<<<< HEAD
  isClose: z.boolean(),
});

export type Thread = z.infer<typeof threadIdSchema>;
=======
});
>>>>>>> 2ce9cab (thread)
