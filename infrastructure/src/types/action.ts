import z from "zod";
import { moneySchema } from "./money";
import { orderSchema } from "./order";

export const actionIsinSchema = z.string().brand("action");
export type ActionId = z.infer<typeof actionIsinSchema>;

export const actionSchema = z.object({
  ISIN: actionIsinSchema,
  name: z.string().min(1),
  symbol: z.string().min(1),
  market: z.string().min(1),
  activitySector: z.string().min(1),
  price: moneySchema,
  isAvailable: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Action = z.infer<typeof actionSchema>;
export const newActionSchema = actionSchema
  .pick({
    name: true,
    symbol: true,
    market: true,
    activitySector: true,
    // price: true,
    isAvailable: true,
  })
  .extend({
    priceAmount: moneySchema.shape.amount,
    priceCurrency: moneySchema.shape.currency,
    quantity: orderSchema.shape.quantity,
  });
export type NewAction = z.infer<typeof newActionSchema>;

export const updateActionSchema = newActionSchema.pick({
  name: true,
  symbol: true,
  market: true,
  activitySector: true,
  isAvailable: true,
});
export type UpdateAction = z.infer<typeof updateActionSchema>;
export const actionStatsSchema = z.object({
  currentPrice: moneySchema,
  priceChange24h: z.number(),
  priceChange7d: z.number(),
  priceChange30d: z.number(),
  minPrice7d: z.number().positive(),
  maxPrice7d: z.number().positive(),
  averagePrice7d: z.number().positive(),
  totalVolume7d: z.number().int().nonnegative(),
  transactionCount7d: z.number().int().nonnegative(),
  volatility31d: z.number(),
});

export type ActionStats = z.infer<typeof actionStatsSchema>;
