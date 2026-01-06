import z from "zod";
import { moneySchema } from "./money";
import { accountIdSchema } from "./account";

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
export const actionPriceHistorySchema = z.object({
  date: z.iso.datetime(),
  price: z.number().positive(),
  volume: z.number().int().nonnegative(),
});

export const newActionSchema = actionSchema.pick({
  ISIN: true,
  name: true,
  symbol: true,
  market: true,
  activitySector: true,
  price: true,
  isAvailable: true,
});
export type NewAction = z.infer<typeof newActionSchema>;

export const actionStatsSchema = z.object({
  priceChange: z.number(),
  change24h: z.number(),
  change7d: z.number(),
  change30d: z.number(),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive(),
  averagePrice: z.number().positive(),
  totalVolume: z.number().int().nonnegative(),
  transactionCount: z.number().int().nonnegative(),
});

export type ActionPriceHistory = z.infer<typeof actionPriceHistorySchema>;
export type ActionStats = z.infer<typeof actionStatsSchema>;
