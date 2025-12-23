import z from "zod";

export const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string(),
});
