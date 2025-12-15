import mongoose from "mongoose";
import { OrderSchema } from "../schema/OrderSchema";
import { OrderInterface } from "../interface/OrderInterface";

export const OrderModel =
  mongoose.models.orders ||
  mongoose.model<OrderInterface>("orders", OrderSchema);