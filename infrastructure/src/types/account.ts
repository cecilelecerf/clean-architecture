import z from "zod";
import { colorSchema } from "./color";
import { userDtoSchema } from "./user";

export const accountIdSchema = z.string().length(27).brand("account");
export type AccountId = z.infer<typeof accountIdSchema>;

export const accountSchema = z.object({
  IBAN: accountIdSchema,
  name: z.string().min(1),
  balance: z.number().nonnegative(),
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
});
export const accountDTOWithUserSchema = accountDTOSchema.extend({
  user: userDtoSchema,
});

export const newAccountSchema = accountSchema.pick({
  name: true,
  type: true,
  color: true,
});
export type NewAccount = z.infer<typeof newAccountSchema>;
