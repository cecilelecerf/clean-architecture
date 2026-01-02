import z from "zod";
import {
  accountDTOSchema,
  accountIdSchema,
  accountResumeWithUserSchema,
} from "./account";

const transactionIdSchema = z.uuid().brand("transaction");
export type TransactionId = z.infer<typeof transactionIdSchema>;

export const transactionSchema = z.object({
  id: transactionIdSchema,
  label: z.string(),
  fromAccountIban: accountIdSchema,
  toAccountIban: accountIdSchema,
  amount: z.any(),
  currency: z.string().min(1),
  date: z.iso.datetime(),
  type: z.enum(["credit", "debit"]),
  icon: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionDTOWithIbanSchema = transactionSchema
  .pick({
    id: true,
    label: true,
    fromAccountIban: true,
    toAccountIban: true,
    amount: true,
    currency: true,
    date: true,
    icon: true,
    type: true,
  })

export const transactionDTOSchema = transactionSchema
  .pick({
    id: true,
    label: true,
    amount: true,
    currency: true,
    date: true,
    icon: true,
    type: true,
  })
  .extend({
    fromAccount: accountDTOSchema,
    toAccount: accountDTOSchema,
  });
export type TransactionDTO = z.infer<typeof transactionDTOSchema>;

export const transactionDTOWithAccountResumeSchema =
  transactionDTOSchema.extend({
    fromAccount: accountResumeWithUserSchema,
    toAccount: accountResumeWithUserSchema,
  });
export type TransactionWithAccountDTO = z.infer<
  typeof transactionDTOWithAccountResumeSchema
>;
export const newTransactionSchema = transactionSchema.pick({
  label: true,
  amount: true,
  icon: true,
  toAccountIban: true,
  currency: true,
});
export type NewTransaction = z.infer<typeof newTransactionSchema>;
