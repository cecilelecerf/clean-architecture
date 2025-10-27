import z from "zod";

export const userIdSchema = z.uuid().brand("user");

export const userSchema = z.object({
  id: userIdSchema,
  firstname: z.string(),
  lastname: z.string(),
  email: z.email(),
  passwordHash: z.string(),
  role: z.enum(["client", "conseiller", "directeur"]),
  isActive: z.boolean(),
  createdAt: z.date(),
  confirmedAt: z.date(),
  modifiedAt: z.date(),
});
export type User = z.infer<typeof userSchema>;

export const userDtoSchema = userSchema.pick({
  id: true,
  firstname: true,
  lastname: true,
  email: true,
});
export type UserDto = z.infer<typeof userDtoSchema>;
