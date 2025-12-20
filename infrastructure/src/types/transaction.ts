import z from "zod";
import { accountIdSchema } from "./account";

const transactionIdSchema = z.uuid().brand("transaction");
export type TransactionId = z.infer<typeof transactionIdSchema>;

export const transactionSchema = z.object({
  id: transactionIdSchema,
  label: z.string(),
  fromAccountId: accountIdSchema,
  toAccountId: accountIdSchema,
  amount: z.any(),
  currency: z.string().min(1),
  date: z.date(),
  type: z.enum(["credit", "debit"]),
  icon: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;
