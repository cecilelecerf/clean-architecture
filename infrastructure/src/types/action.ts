import z from "zod";

export const actionIdSchema = z.uuid().brand("action");
export type ActionId = z.infer<typeof actionIdSchema>;

export const actionSchema = z.object({
  ISIN: actionIdSchema,
  name: z.string().min(1),
  totalNb: z.number().nonnegative(),
  symbol: z.string().min(1),
  market: z.string().min(1),
  activitySector: z.string().min(1),
  priceAmount: z.number().nonnegative(),
  priceCurrency: z.string().min(1),
  isAvailable: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Action = z.infer<typeof actionSchema>;
