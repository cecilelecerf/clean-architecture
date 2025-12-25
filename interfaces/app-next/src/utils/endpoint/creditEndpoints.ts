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
  // Détails d'un crédit
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
        // Invalide toutes les listes de crédits
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
        // Invalide potentiellement les listes par utilisateur
        queryClient.invalidateQueries({ queryKey: ['credits', 'list', 'users'] });
        // Invalide les comptes car le solde peut avoir changé
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      },
    }),

  // PATCH /api/credits/:creditId
  // ApplyMonthlyCreditPaiement
  paiement: ({ creditId }: { creditId: CreditId }) =>
    mutationOptions({
      mutationFn: (data: { name?: string }) => patch(`/credits/${creditId}`, data),
      onSuccess: () => {
        // Invalide le crédit spécifique
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        // Invalide toutes les listes de crédits
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
        // Invalide les listes par utilisateur (car le crédit pourrait appartenir à n'importe quel user)
        queryClient.invalidateQueries({ queryKey: ['credits', 'list', 'users'] });
        // Invalide les comptes car un paiement modifie les soldes
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        // Invalide les transactions liées au crédit
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
    }),

  // GET /api/credits/users/:userId
  // Liste des crédits d'un utilisateur spécifique
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
      mutationFn: ({ payload, userId }: { payload: CreditResponse; userId: UserId }) =>
        patch(`/credits/${creditId}/grant`, payload),
      onSuccess: (data, variables) => {
        // Invalide le crédit spécifique
        queryClient.invalidateQueries({ queryKey: ['credits', creditId] });
        // Invalide toutes les listes de crédits
        queryClient.invalidateQueries({ queryKey: ['credits', 'list'] });
        // Invalide les listes par utilisateur
        queryClient.invalidateQueries({ queryKey: ['credits', 'list', 'users', variables.userId] });
        // Si le crédit est accepté, invalide les comptes car le montant sera débloqué
        if (variables.payload.accept) {
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
        // Invalide les notifications non lues (nouveau statut de crédit)
        queryClient.invalidateQueries({ queryKey: ['feeds', 'posts', 'unread'] });
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
