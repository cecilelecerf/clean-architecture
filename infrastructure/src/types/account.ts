import z from "zod";
import { colorSchema } from "./color";

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
