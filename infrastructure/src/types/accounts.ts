import z from "zod";

export const AccountSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  IBAN: z.string().length(27),
  balance: z.number().nonnegative(),
  type: z.enum(["checking", "savings"]),
});

export type Account = z.infer<typeof AccountSchema>;

export const AccountsSchema = z.array(AccountSchema);
