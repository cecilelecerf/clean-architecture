import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { AccountId, accountSchema } from '@infrastructure/types/account';
import { threadSchema } from '@infrastructure/types/thread';
import z from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { transactionSchema } from '@infrastructure/types/transaction';
import { UserId } from '@infrastructure/types/user';

// ============================================================================
// SCHEMAS
// ============================================================================
export type Account = z.infer<typeof accountSchema>;

export const renameAccountSchema = accountSchema.pick({
  name: true
});
export type renameAccount = z.infer<typeof renameAccountSchema>;

export const transferAccountSchema = accountSchema.pick({
  IBAN: true
});
export type transferAccount = z.infer<typeof transferAccountSchema>;

export const transferTransactionSchema = transactionSchema.pick({
  amount: true,
  currency: true,
  label: true,
  icon: true
});
export type transferTransaction = z.infer<typeof transferTransactionSchema>;

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
  // Détails d'un compte avec transactions
  get: ({ accountIban }: { accountIban: AccountId }) =>
    queryOptions({
      queryKey: ['accounts', accountIban],
      queryFn: () => get(`/accounts/${accountIban}`).then((data) => accountSchema.parse(data)),
    }),

  // POST /api/accounts
  // Créer un nouveau compte
  create: () =>
    mutationOptions({
      mutationFn: async (payload: Account) => {
        const data = await post('/posts', payload);
        return accountSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', 'list', ] });
      },
    }),

  // PATCH /api/accounts/:accountIban/rename
  // Modifier un compte (nom)
  update: ({ accountIban }: { accountIban: AccountId }) =>
    mutationOptions({
      mutationFn: (data: { name?: string }) => patch(`/accounts/${accountIban}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts', accountIban] });
        queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] });
      },
    }),

    // POST /api/accounts/:accountIban/transfer
    // Transférer un thread à un autre conseiller
    transfer: ({ accountIban }: { accountIban: AccountId }) =>
      mutationOptions({
        mutationFn: () =>
          patch(`/accounts/${accountIban}/transfer`, { }),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['accountIban', accountIban] });
          queryClient.invalidateQueries({ queryKey: ['accountIban', 'list'] });
        },
    }),

    // DELETE /api/threads/:accountIban/delete
    // Supprtion d'un participant
    remove: ({ accountIban }: { accountIban: AccountId }) =>
      mutationOptions({
        mutationFn: ({ userId }: { userId: UserId }) =>
          deleteEntity(`/threads/${accountIban}/delete`).then((data) =>
            safeParseWithLog(threadSchema, data),
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threads', accountIban] });
        },
    }),
});
