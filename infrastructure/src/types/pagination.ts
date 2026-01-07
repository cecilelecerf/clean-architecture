import z from "zod";
import { transactionSchema } from "./transaction";

export const paginationSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type PaginationType = z.infer<typeof paginationSchema>;

export const querySchema = paginationSchema.extend({
  type: transactionSchema.shape.type.optional(),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
  label: transactionSchema.shape.label.optional(),
});
export type TransactionFilters = z.infer<typeof querySchema>;
