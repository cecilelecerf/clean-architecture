import { savingRateSchema } from '@infrastructure/types/savingsrate';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { safeParseWithLog } from '@/lib/zodUtils';

// ============================================================================
// SCHEMAS
// ============================================================================

export const newSavingsrateSchema = savingRateSchema.pick({
  rate: true,
  effectiveDate: true,
});
export type NewSavingsrate = z.infer<typeof newSavingsrateSchema>;

// ============================================================================
// SAVINGS RATE ENDPOINTS
// ============================================================================

export const savingsrateEndpoint = createEndpointsNodes({
  getAll: () =>
    queryOptions({
      queryKey: ['savings-rate', 'list'],
      queryFn: () =>
        get(`/savings-rate`).then((data) => safeParseWithLog(savingRateSchema.array(), data)),
    }),

  getCurrent: () =>
    queryOptions({
      queryKey: ['savings-rate', 'current'],
      queryFn: () =>
        get(`/savings-rate/current`).then((data) =>
          safeParseWithLog(savingRateSchema.nullable(), data),
        ),
    }),

  // POST /api/savingsrate
  // Créer un nouveau taux d'interet
  create: () =>
    mutationOptions({
      mutationFn: async (payload: NewSavingsrate) => {
        const data = await post('/savings-rate', payload);
        return savingRateSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savings-rate', 'list'] });
      },
    }),
});
