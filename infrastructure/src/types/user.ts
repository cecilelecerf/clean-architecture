import z from "zod";

export const userIdSchema = z.uuid().brand("user");
export type UserId = z.infer<typeof userIdSchema>;
export const userSchema = z.object({
  id: userIdSchema,
  firstname: z.string(),
  lastname: z.string(),
  email: z.email(),
  passwordHash: z.string(),
  role: z.enum(["client", "conseiller", "directeur"]),
  isActiveField: z.preprocess((val) => val === 1 || val === true, z.boolean()),
  createdAt: z.iso.datetime(),
  confirmedAt: z.iso.datetime().nullable().optional(),
  updatedAt: z.iso.datetime().nullable(),
});
export type User = z.infer<typeof userSchema>;

export const payloadUserUpdateSchema = userSchema.pick({
  firstname: true,
  lastname: true,
  email: true,
});
export type PayloadUserUpdateSchema = z.infer<typeof payloadUserUpdateSchema>;

export const userDtoSchema = userSchema.pick({
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  role: true,
  isActiveField: true,
  confirmedAt: true,
});
export type UserDto = z.infer<typeof userDtoSchema>;

export const advisorStat = z.object({
  acceptedCreditsCount: z.number(),
  refusedCreditsCount: z.number(),
  activeThreadsCount: z.number(),
});
