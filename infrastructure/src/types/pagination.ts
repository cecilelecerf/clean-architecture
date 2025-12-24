import z from "zod";

export const paginationSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type PaginationType = z.infer<typeof paginationSchema>;
