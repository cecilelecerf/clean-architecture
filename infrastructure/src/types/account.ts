import z from "zod";
import { colorSchema } from "./color";
import { userDtoSchema, userIdSchema } from "./user";
import { moneySchema } from "./money";
import { currencyCodeSchema } from "./currency";

export const accountIdSchema = z.string().brand("account");
export type AccountId = z.infer<typeof accountIdSchema>;

export const accountSchema = z.object({
  IBAN: accountIdSchema,
  name: z.string().min(1),
  balance: moneySchema,
  type: z.enum(["courant", "epargne"]),
  color: colorSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  userId: userIdSchema.nullable(),
});
export type Account = z.infer<typeof accountSchema>;

export const accountDTOSchema = accountSchema.pick({
  IBAN: true,
  name: true,
  color: true,
  type: true,
  balance: true,
  userId: true,
});
export type AccountDTO = z.infer<typeof accountDTOSchema>;

export const accountWithUserSchemaDTO = accountDTOSchema.extend({
  user: userDtoSchema.nullable(),
});
export type AccountWithUserDTO = z.infer<typeof accountWithUserSchemaDTO>;

export const accountResumeSchema = accountSchema.pick({
  IBAN: true,
  name: true,
  color: true,
  type: true,
});
export const accountResumeWithUserSchema = accountResumeSchema.extend({
  user: userDtoSchema.nullable().optional(),
});
export type AccountResumeWithUser = z.infer<typeof accountResumeWithUserSchema>;

export const newAccountSchema = accountSchema
  .pick({
    name: true,
    type: true,
    color: true,
  })
  .extend({ currency: z.string() });
export type NewAccount = z.infer<typeof newAccountSchema>;
