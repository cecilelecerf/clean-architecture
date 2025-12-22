import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { AccountId, accountSchema, NewAccount } from '@infrastructure/types/account';
import { threadSchema } from '@infrastructure/types/thread';
import z from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { transactionEndpoint } from './transactionEndpoints';

// ============================================================================
// SCHEMAS
// ============================================================================

export const renameAccountSchema = accountSchema.pick({
  name: true,
});
export type renameAccount = z.infer<typeof renameAccountSchema>;

// ============================================================================
// ACCOUNTS ENDPOINTS
// ============================================================================

export const accountsEndpoint = createEndpointsNodes({
  // GET /api/accounts
  // Liste des comptes selon l'utilisateur (client ou banque)
  getAll: () =>
    queryOptions({
      queryKey: ['accounts', 'list'],
      queryFn: () =>
        get('/accounts').then((data) => {
          return safeParseWithLog(accountSchema.array(), data);
        }),
    }),

  // GET /api/accounts/:accountIban
  // Détails d'un compte
  get: ({ accountIban }: { accountIban: AccountId }) =>
    queryOptions({
      queryKey: ['accounts', accountIban],
      queryFn: () => get(`/accounts/${accountIban}`).then((data) => accountSchema.parse(data)),
    }),

  // POST /api/accounts
  // Créer un nouveau compte
  create: () =>
    mutationOptions({
      mutationFn: async (payload: NewAccount) => {
        console.log(payload);
        const data = await post('/accounts', payload);
        return accountSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] });
      },
    }),

  // PATCH /api/accounts/:accountIban/rename
  // Modifier un compte
  update: ({ accountIban }: { accountIban: AccountId }) =>
    mutationOptions({
      mutationFn: (data: { name?: string }) => patch(`/accounts/${accountIban}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts', accountIban] });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] });
      },
    }),

  // DELETE /api/accounts/:accountIban
  // Supprtion d'un participant
  remove: ({ accountIban }: { accountIban: AccountId }) =>
    mutationOptions({
      mutationFn: () =>
        deleteEntity(`/accounts/${accountIban}`).then((data) =>
          safeParseWithLog(threadSchema, data),
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts', accountIban] });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] });
      },
    }),
  transactions: transactionEndpoint,
});
