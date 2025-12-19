import mongoose from "mongoose";
import { OrderSchema } from "../schema/OrderSchema";
import { OrderInterface } from "../interface/OrderInterface";

export const OrderModel =
  mongoose.models.Order || mongoose.model<OrderInterface>("Order", OrderSchema);
