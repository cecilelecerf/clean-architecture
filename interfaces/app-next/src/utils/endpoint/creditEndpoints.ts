import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { creditDTOSchema, CreditId, creditSchema } from "@infrastructure/types/credit";
import z from "zod";
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';

// ============================================================================
// SCHEMAS
// ============================================================================

export const requestCreditSchema = creditSchema.pick({
  initialAmount: true,
  insuranceRate: true,
  interestRate: true,
  durationMonths: true
});
export type requestCredit = z.infer<typeof requestCreditSchema>;

// ============================================================================
// CREDIT ENDPOINTS
// ============================================================================

export const creditsEndpoint = createEndpointsNodes({
  // GET /api/credits
  // Liste des crédits des clients
  getAll: () =>
    queryOptions({
      queryKey: ['credits', 'list'],
      queryFn: () =>
        get('/credits').then((data) => {
          return safeParseWithLog(creditDTOSchema.array(), data);
        }),
    }),

  // GET /api/credits/:creditId
  // Détails d'un compte
  get: ({ creditId }: { creditId: CreditId }) =>
    queryOptions({
      queryKey: ['credits', creditId],
      queryFn: () => get(`/credits/${creditId}`).then((data) => creditDTOSchema.parse(data)),
    }),

  // POST /api/credits
  // Créer une nouvelle demande de crédit
  create: () =>
    mutationOptions({
      mutationFn: async (payload: requestCredit) => {
        console.log(payload);
        const data = await post('/credits', payload);
        return creditSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
      },
    }),

  // PATCH /api/credits/:creditId
  // ApplyMonthlyCreditPaiement
  paiement: ({ creditId }: { creditId: CreditId }) =>
    mutationOptions({
      mutationFn: (data: { name?: string }) => patch(`/credits/${creditId}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
      },
    }),

  // PATCH /api/credits/:creditId/advisor
  // Acceptation ou refus du crédit de la part d'un conseiller
  update: ({ creditId }: { creditId: CreditId }) =>
    mutationOptions({
      mutationFn: (data: { name?: string }) => patch(`/credits/${creditId}/advisor`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
      },
    }),
})