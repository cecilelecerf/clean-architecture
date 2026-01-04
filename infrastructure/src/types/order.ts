import z from "zod";
import { userIdSchema } from "./user";
import { actionIdSchema } from "./action";
import { moneySchema } from "./money";

export const orderIdSchema = z.uuid().brand("order");
export type OrderId = z.infer<typeof orderIdSchema>;

export const orderSchema = z.object({
  id: orderIdSchema,
  userId: userIdSchema,
  actionId: actionIdSchema,
  type: z.enum(["buy", "sell"]),
  quantity: z.number().nonnegative(),
  price: moneySchema,
  fee: moneySchema,
  date: z.iso.datetime(),
  status: z.enum(["pending", "executed", "cancelled"]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
});

export const orderDTOSchema = orderSchema.pick({
  id: true,
  type: true,
  quantity: true,
  price: true,
  fee: true,
  date: true,
  status: true,
  actionId: true,
});

export const portfolioPositionSchema = z.object({
  isin: z.string(),
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
