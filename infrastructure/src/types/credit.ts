import z from "zod";
import { userDtoSchema, userIdSchema } from "./user";
import { moneySchema } from "./money";

export const creditIdSchema = z.string().brand("credit");
export type CreditId = z.infer<typeof creditIdSchema>;

export const creditSchema = z.object({
  id: creditIdSchema,
  userId: userIdSchema,
  initialAmount: moneySchema,
  interestRate: z.number().nonnegative(),
  insuranceRate: z.number().nonnegative(),
  durationMonths: z.number().nonnegative(),
  startDate: z.iso.datetime(),
  monthlyPayment: moneySchema,
  remainingBalance: moneySchema,
  status: z.enum(["PENDING", "ACCEPTED", "REFUSED", "COMPLETED"]),
  createdAt: z.iso.datetime(),
  advisorId: userIdSchema.optional(),
  updatedAt: z.iso.datetime(),
});

export const creditResponseSchema = z.object({
  accept: z.boolean(),
});
export type CreditResponse = z.infer<typeof creditResponseSchema>;

export const creditDTOSchema = creditSchema.pick({
  id: true,
  initialAmount: true,
  interestRate: true,
  insuranceRate: true,
  durationMonths: true,
  startDate: true,
  monthlyPayment: true,
  remainingBalance: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  advisorId: true,
  userId: true,
});

export type CreditDTO = z.infer<typeof creditDTOSchema>;

export const creditDTOWithUserSchema = creditDTOSchema.extend({
  user: userDtoSchema,
});
export type CreditDTOWithUser = z.infer<typeof creditDTOWithUserSchema>;
