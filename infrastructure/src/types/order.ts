import z from "zod";
import { userIdSchema } from "./user";
import { actionIdSchema } from "./action";
import { moneySchema } from "./money";

export const orderIdSchema = z.string().length(27).brand("order");
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
    updatedAt: z.iso.datetime().optional()
})

export const orderDTOSchema = orderSchema.pick({
  id: true,
  type: true,
  quantity: true,
  price: true,
  fee: true,
  date: true,
  status: true
});