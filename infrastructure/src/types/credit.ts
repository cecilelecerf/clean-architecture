import z from "zod";
import { userDtoSchema, userIdSchema } from "./user";
import { moneySchema } from "./money";
import { accountDTOSchema, accountIdSchema, accountWithUserSchemaDTO } from "./account";
import { formuleDTOSchema, formuleIdSchema } from "./formule";
import { transactionDTOWithIbanSchema } from "./transaction";

export const creditIdSchema = z.uuid().brand("credit");
export type CreditId = z.infer<typeof creditIdSchema>;

export const creditSchema = z.object({
  id: creditIdSchema,
  accountId: accountIdSchema,
  formuleCreditId: formuleIdSchema,
  initialAmount: moneySchema,
  durationMonths: z.number().nonnegative(),
  startDate: z.iso.datetime(),
  monthlyPayment: moneySchema,
  remainingBalance: moneySchema,
  status: z.enum(["PENDING", "ACCEPTED", "REFUSED", "COMPLETED"]),
  createdAt: z.iso.datetime(),
  advisorId: userIdSchema.nullable().optional(),
  updatedAt: z.iso.datetime(),
  reason: z.string().optional()
});

export const creditResponseSchema = z.object({
  accept: z.boolean(),
  reason: z.string().nullable().optional()
});
export type CreditResponse = z.infer<typeof creditResponseSchema>;

export const creditDTOSchema = creditSchema.pick({
  id: true,
  initialAmount: true,
  durationMonths: true,
  startDate: true,
  monthlyPayment: true,
  remainingBalance: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  advisorId: true,
  accountId: true,
  formuleCreditId: true,
  reason: true
});

export type CreditDTO = z.infer<typeof creditDTOSchema>;

export const creditDTOWithFormuleAndAccountSchema = creditDTOSchema.extend({
  account: accountWithUserSchemaDTO,
  formule: formuleDTOSchema
});
export type CreditDTOWithFormuleAndAccount = z.infer<typeof creditDTOWithFormuleAndAccountSchema>;

export const creditDTOWithFormuleSchema = creditDTOSchema.extend({
  formule: formuleDTOSchema
});
export type CreditDTOWithFormule = z.infer<typeof creditDTOWithFormuleSchema>;

export const creditDTOWithFormuleAndAdvisorSchema = creditDTOSchema.extend({
  advisor: userDtoSchema,
  formule: formuleDTOSchema,
  account: accountDTOSchema,
  transactions: z.array(transactionDTOWithIbanSchema)
});
export type CreditDTOWithFormuleAndAdvisor = z.infer<typeof creditDTOWithFormuleAndAdvisorSchema>;
