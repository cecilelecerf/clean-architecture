import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { createEndpointsNodes } from '../createEndpointNode';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import {
  CreateCurrency,
  CurrencyCode,
  currencySchema,
  UpdateCurrency,
} from '@infrastructure/types/currency';
import { queryClient } from '@/lib/queryClient';

export const currenciesEndpoint = createEndpointsNodes({
  // GET /api/currencies
  // Liste de toutes les devises
  getAll: () =>
    queryOptions({
      queryKey: ['currencies', 'list'],
      queryFn: () =>
        get('/currencies').then((data) => safeParseWithLog(currencySchema.array(), data)),
    }),

  // GET /api/currencies/:code
  // Récupération d'une devise par code
  getByCode: ({ currencyCode }: { currencyCode: CurrencyCode }) =>
    queryOptions({
      queryKey: ['currencies', currencyCode],
      queryFn: () =>
        get(`/currencies/${currencyCode}`).then((data) => safeParseWithLog(currencySchema, data)),
    }),

  // POST /api/accounts/:accountIban/transactions
  // Créer une transaction
  new: () =>
    mutationOptions({
      mutationFn: async (payload: CreateCurrency) => {
        const data = await post(`/currencies`, payload);
        return currencySchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['currencies', 'list'],
        });
      },
    }),
  update: ({ currencyCode }: { currencyCode: CurrencyCode }) =>
    mutationOptions({
      mutationFn: async (payload: UpdateCurrency) => {
        const data = await patch(`/currencies/${currencyCode}`, payload);
        return currencySchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['currencies', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['currencies', currencyCode],
        });
      },
    }),
  delete: ({ currencyCode }: { currencyCode: CurrencyCode }) =>
    mutationOptions({
      mutationFn: async () => await deleteEntity(`/currencies/${currencyCode}`),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['currencies', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['currencies', currencyCode],
        });
      },
    }),
});
