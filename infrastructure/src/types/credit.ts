import z from "zod";
import { userIdSchema } from "./user";
import { moneySchema } from "./money";

export const creditIdSchema = z.string().length(27).brand("credit");
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
    updatedAt: z.iso.datetime().optional()
})