import z from "zod";
import { userIdSchema } from "./user";
import { actionIsinSchema } from "./action";
import { moneySchema } from "./money";
import { accountIdSchema } from "./account";

export const orderIdSchema = z.uuid().brand("order");
export type OrderId = z.infer<typeof orderIdSchema>;

export const orderSchema = z.object({
  id: orderIdSchema,
  IBAN: accountIdSchema,
  ISIN: actionIsinSchema,
  type: z.enum(["buy", "sell"]),
  quantity: z.number().int().nonnegative(),
  price: moneySchema,
  date: z.iso.datetime().optional(),
  status: z.enum(["pending", "executed", "cancelled"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
});
export type Order = z.infer<typeof orderSchema>;

export const buyActionSchema = orderSchema.pick({
  quantity: true,
  IBAN: true,
  price: true,
});
export type BuyAction = z.infer<typeof buyActionSchema>;

export const portfolioPositionSchema = z.object({
  ISIN: z.string(),
  symbol: z.string(),
  name: z.string(),
  quantity: z.number().int().nonnegative(),
  averagePrice: z.number().positive(),
  currentPrice: z.number().positive(),
  currency: z.string(),
  totalInvested: z.number().nonnegative(),
  currentValue: z.number().nonnegative(),
  gainLoss: z.number(),
  gainLossPercent: z.number(),
});

export const portfolioSchema = z.object({
  positions: z.array(portfolioPositionSchema),
  totalValue: z.number().nonnegative(),
  totalInvested: z.number().nonnegative(),
  totalGainLoss: z.number(),
  totalGainLossPercent: z.number(),
  currency: z.string(),
});

export type PortfolioPosition = z.infer<typeof portfolioPositionSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
