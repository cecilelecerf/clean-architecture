import z from "zod";

export const savingrateIdSchema = z.uuid().brand("savingrate");
export type SavingRateId = z.infer<typeof savingrateIdSchema>;

export const savingRateSchema = z.object({
  id: savingrateIdSchema,
  rate: z.number().nonnegative(),
  effectiveDate: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type SavingRate = z.infer<typeof savingRateSchema>;

export const savingsRateFormSchema = z.object({
  rate: z.number().positive(),
  effectiveDate: z.string().min(1),
});

export type SavingsRateFormValues = z.infer<typeof savingsRateFormSchema>;