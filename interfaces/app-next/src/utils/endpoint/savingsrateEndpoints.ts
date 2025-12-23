import { savingRateSchema } from "@infrastructure/types/savingsrate";
import z from "zod";
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions } from '@tanstack/react-query';
import { post } from "@/lib/apiClient";
import { queryClient } from "@/lib/queryClient";

// ============================================================================
// SCHEMAS
// ============================================================================

export const newSavingsrateSchema = savingRateSchema.pick({
  rate: true,
  effectiveDate: true
});
export type newSavingsrate = z.infer<typeof newSavingsrateSchema>;

// ============================================================================
// SAVINGS RATE ENDPOINTS
// ============================================================================

export const savingsrateEndpoint = createEndpointsNodes({
  // POST /api/savingsrate
  // Créer un nouveau taux d'interet 
  create: () =>
    mutationOptions({
      mutationFn: async (payload: newSavingsrate) => {
        console.log(payload);
        const data = await post('/savingsrate', payload);
        return savingRateSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['savingsrate', 'list'] });
      },
    }),
})