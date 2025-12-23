import z from "zod";
import { colorSchema } from "./color";
import { userDtoSchema } from "./user";

export const accountIdSchema = z.string().length(26).brand("account");
export type AccountId = z.infer<typeof accountIdSchema>;

export const accountSchema = z.object({
  IBAN: accountIdSchema,
  name: z.string().min(1),
  balance: z.number().nonnegative(),
  amount: z.number().nonnegative(),
  type: z.enum(["courant", "epargne"]),
  color: colorSchema,
  currency: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Account = z.infer<typeof accountSchema>;

export const accountDTOSchema = accountSchema.pick({
  IBAN: true,
  name: true,
  color: true,
  type: true,
  currency: true,
  amount: true,
});

export const accountResumeSchema = accountSchema.pick({
  IBAN: true,
  name: true,
});
export const accountResumeWithUserSchema = accountResumeSchema.extend({
  user: userDtoSchema,
});
export type AccountResumeWithUser = z.infer<typeof accountResumeWithUserSchema>;

export const newAccountSchema = accountSchema.pick({
  name: true,
  type: true,
  color: true,
});
export type NewAccount = z.infer<typeof newAccountSchema>;
