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
  transactionDTOWithAccountResumeSchema,
  TransactionId,
  transactionSchema,
} from '@infrastructure/types/transaction';
import { safeParseWithLog } from '@/lib/zodUtils';
import { paginationSchema } from '@/components/PaginationComponent';

export const querySchema = paginationSchema.extend({
  type: transactionSchema.shape.type.optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  label: transactionSchema.shape.label.optional(),
});
export type TransactionFilters = z.infer<typeof querySchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildTransactionsQueryParams(filters?: TransactionFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

  if (filters.label) params.set('label', filters.label);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.fromDate) params.set('fromDate', filters.fromDate);
  if (filters.toDate) params.set('toDate', filters.toDate);
  if (filters.type) params.set('type', filters.type);

  return params;
}

// ============================================================================
// TRANSACTIONS ENDPOINTS
// ============================================================================

export const transactionEndpoint = createEndpointsNodes({
  // GET /api/accounts/:accountIban/transactions
  // Transactions d'un account
  getAll: ({ accountIban, filters }: { accountIban: AccountId; filters?: TransactionFilters }) =>
    queryOptions({
      queryKey: ['accounts', accountIban, 'transactions', 'list'],
      queryFn: async () => {
        const params = buildTransactionsQueryParams(filters);
        const data = await get(`/accounts/${accountIban}/transactions?${params.toString()}`);
        return safeParseWithLog(
          z.object({ transactions: transactionSchema.array(), total: z.number() }),
          data,
        );
      },
    }),

  // GET /api/accounts/:accountIban/transactions/:transactionId
  // Détails d'une transaction'
  get: ({ transactionId, accountIban }: { transactionId: TransactionId; accountIban: AccountId }) =>
    queryOptions({
      queryKey: ['accounts', accountIban, 'transactions', transactionId],
      queryFn: async () => {
        const data = await get(`/accounts/${accountIban}/transactions/${transactionId}`);
        return safeParseWithLog(transactionDTOWithAccountResumeSchema, data);
      },
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
