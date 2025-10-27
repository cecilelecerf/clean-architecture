import z from "zod";

export const moneySchema = z.object({
  amount: z.string(),
  currency: z.string(),
});
