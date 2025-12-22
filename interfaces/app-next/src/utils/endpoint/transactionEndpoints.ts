import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { AccountId, accountSchema, NewAccount } from '@infrastructure/types/account';
import { threadSchema } from '@infrastructure/types/thread';
import z from 'zod';
import { queryClient } from '@/lib/queryClient';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import {
  NewTransaction,
  transactionDTOSchema,
  TransactionId,
  transactionSchema,
} from '@infrastructure/types/transaction';

// ============================================================================
// TRANSACTIONS ENDPOINTS
// ============================================================================

export const transactionEndpoint = createEndpointsNodes({
  // GET /api/accounts/:accountIban/transactions
  // Transactions d'un account
  getAll: ({ accountIban }: { accountIban: AccountId }) =>
    queryOptions({
      queryKey: ['accounts', accountIban, 'transactions', 'list'],
      queryFn: () =>
        get(`/accounts/${accountIban}/transactions`).then((data) =>
          transactionSchema.array().parse(data),
        ),
    }),

  // GET /api/accounts/:accountIban/transactions/:transactionId
  // Détails d'une transaction'
  get: ({ transactionId, accountIban }: { transactionId: TransactionId; accountIban: AccountId }) =>
    queryOptions({
      queryKey: ['accounts', accountIban, 'transactions', transactionId],
      queryFn: () =>
        get(`/accounts/${accountIban}/transactions/${transactionId}`).then((data) =>
          transactionDTOSchema.parse(data),
        ),
    }),

  // POST /api/accounts/:accountIban/transactions
  // Créer une transaction
  new: ({ accountIban }: { accountIban: AccountId }) =>
    mutationOptions({
      mutationFn: async (payload: NewTransaction) => {
        const data = await post(`/accounts/${accountIban}/transactions`, payload);
        return accountSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['accounts', accountIban, 'transactions', 'list'],
        });
      },
    }),
});
