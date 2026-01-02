import z from "zod";
import { accountIdSchema } from "./account";
export const formuleIdSchema = z.uuid().brand("formule");
export type FormuleId = z.infer<typeof formuleIdSchema>;

export const formuleSchema = z.object({
    id: formuleIdSchema,
    interestRate: z.number().nonnegative(),
    insuranceRate: z.number().nonnegative(),
    type: z.string(),
    label: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    accountId: accountIdSchema,
    createdAt: z.iso.datetime(),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
    updatedAt: z.iso.datetime().optional(),
    currency: z.string().optional()
});

export const formuleDTOSchema = formuleSchema.pick({
    id: true,
    interestRate: true,
    insuranceRate: true, 
    type: true,
    label: true,
    description: true,
    isActive: true,
    accountId: true,
    minAmount: true,
    maxAmount: true,
    currency: true
})

export type FormuleDTO = z.infer<typeof formuleDTOSchema>;

export const formuleTypesSchema = formuleSchema.pick({
    type: true
})

export type FormuleTypes = z.infer<typeof formuleTypesSchema>;