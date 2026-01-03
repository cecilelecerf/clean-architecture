import { z } from "zod";

export const advisorStatSchema = z.object({
  acceptedCreditsCount: z.number(),
  refusedCreditsCount: z.number(),
  activeThreadsCount: z.number(),
});

export const directorStatSchema = z.object({
  totalAdvisors: z.number(),
  totalClients: z.number(),
  totalActions: z.number(),
});

export const userStatsSchema = z.union([advisorStatSchema, directorStatSchema]);
export type AdvisorStat = z.infer<typeof advisorStatSchema>;
export type DirectorStat = z.infer<typeof directorStatSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
