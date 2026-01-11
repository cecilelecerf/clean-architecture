import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import {
  CreditDTO,
  creditDTOSchema,
  creditDTOWithFormuleAndAccountSchema,
  creditDTOWithFormuleSchema,
  CreditId,
  CreditResponse,
  creditSchema,
} from '@infrastructure/types/credit';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';
import { UserId } from '@infrastructure/types/user';
import { FormuleId } from '@infrastructure/types/formule';

// ============================================================================
// SCHEMAS
// ============================================================================

export const requestCreditSchema = creditSchema.pick({
  accountId: true,
  formuleCreditId: true,
  durationMonths: true,
  startDate: true,
  initialAmount: true,
});
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
          return safeParseWithLog(creditDTOWithFormuleSchema.array(), data);
        }),
    }),

  // GET /api/credits
  // Liste des crédits par rapport à la formule
  getAllByFormuleId: ({ formuleId }: { formuleId: FormuleId }) =>
    queryOptions({
      queryKey: ['credits', 'list', formuleId],
      queryFn: () =>
        get(`/credits/formules/${formuleId}`).then((data) => {
          return safeParseWithLog(creditDTOSchema.array(), data);
        }),
    }),

  // GET /api/credits/:creditId
  // Détails d'un crédit
  get: ({ creditId }: { creditId: CreditId }) =>
    queryOptions({
      queryKey: ['credits', creditId],
      queryFn: () =>
        get(`/credits/${creditId}`).then((data) =>
          safeParseWithLog(creditDTOWithFormuleAndAccountSchema, data),
        ),
    }),

  // GET /api/credits/status?label='status'
  // Liste des crédits des clients en cours de traitement
  getAllByStatus: ({ status }: { status?: CreditDTO['status'] }) =>
    queryOptions({
      queryKey: ['credits', 'list', status],
      queryFn: () =>
        get(`/credits/status?${status !== undefined ? `label=${status}` : ''}`).then((data) => {
          return safeParseWithLog(creditDTOWithFormuleSchema.array(), data);
        }),
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
        // Invalide toutes les listes de crédits
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
        // Invalide potentiellement les listes par utilisateur
        queryClient.invalidateQueries({ queryKey: ['credits', 'list', 'users'] });
        // Invalide les comptes car le solde peut avoir changé
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
    }),

  // GET /api/credits/users/:userId
  // Liste des crédits d'un utilisateur spécifique
  getAllByClientId: ({ userId }: { userId: UserId }) =>
    queryOptions({
      queryKey: ['credits', 'list', 'users', userId],
      queryFn: () =>
        get(`/credits/users/${userId}`).then((data) => {
          return safeParseWithLog(creditDTOWithFormuleSchema.array(), data);
        }),
    }),

  // PATCH /api/credits/:creditId/grant
  // Acceptation ou refus du crédit de la part d'un conseiller
  grant: ({ creditId }: { creditId: CreditId }) =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: CreditResponse }) =>
        patch(`/credits/${creditId}/grant`, payload),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
        if (variables.payload.accept) {
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
      },
    }),

  // DELETE /api/credits/:creditId
  // Supprimer une demande de crédit (si jamais nécessaire)
  delete: ({ creditId }: { creditId: CreditId }) =>
    mutationOptions({
      mutationFn: () => deleteEntity(`/credits/${creditId}`),
      onSuccess: () => {
        // Invalide le crédit spécifique (il n'existe plus mais nettoie le cache)
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        // Invalide toutes les listes
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['credits', 'list', 'users'] });
      },
    }),
});
