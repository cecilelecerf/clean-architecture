import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import {
  creditDTOSchema,
  creditDTOWithUserSchema,
  CreditId,
  CreditResponse,
  creditSchema,
} from '@infrastructure/types/credit';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';
import { moneySchema } from '@infrastructure/types/money';
import { UserId } from '@infrastructure/types/user';

// ============================================================================
// SCHEMAS
// ============================================================================

export const requestCreditSchema = creditSchema
  .pick({
    insuranceRate: true,
    interestRate: true,
    durationMonths: true,
    startDate: true,
  })
  .extend({ amount: moneySchema.shape.amount, currency: moneySchema.shape.currency });
export type RequestCredit = z.infer<typeof requestCreditSchema>;

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
      queryFn: () =>
        get(`/credits/${creditId}`).then((data) => safeParseWithLog(creditDTOSchema, data)),
    }),

  // POST /api/credits
  // Créer une nouvelle demande de crédit
  create: () =>
    mutationOptions({
      mutationFn: async (payload: RequestCredit) => {
        const data = await post('/credits', payload);
        return safeParseWithLog(creditDTOSchema, data);
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

  getAllByClientId: ({ userId }: { userId: UserId }) =>
    queryOptions({
      queryKey: ['credits', 'list', 'users', userId],
      queryFn: () =>
        get(`/credits/users/${userId}`).then((data) => {
          return safeParseWithLog(creditDTOSchema.array(), data);
        }),
    }),
  // PATCH /api/credits/:creditId/grant
  // Acceptation ou refus du crédit de la part d'un conseiller
  grant: ({ creditId }: { creditId: CreditId }) =>
    mutationOptions({
      mutationFn: (payload: CreditResponse) => patch(`/credits/${creditId}/grant`, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
      },
    }),
});
