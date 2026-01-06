import { z } from "zod";

export const currencyCodeSchema = z.string().length(3).brand("currency");
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
export const currencySchema = z.object({
  code: currencyCodeSchema,
  exchangeRate: z.number().positive(),
  symbol: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type Currency = z.infer<typeof currencySchema>;

export const createCurrencySchema = currencySchema.pick({
  code: true,
  exchangeRate: true,
});

export type CreateCurrency = z.infer<typeof createCurrencySchema>;

export const updateCurrencySchema = currencySchema.pick({
  exchangeRate: true,
});
export type UpdateCurrency = z.infer<typeof updateCurrencySchema>;
