import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, patch, post } from '@/lib/apiClient';
import {
  ActionId,
  actionPriceHistorySchema,
  actionSchema,
  actionStatsSchema,
  BuyAction,
  buyActionSchema,
  NewAction,
} from '@infrastructure/types/action';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { queryClient } from '@/lib/queryClient';

// ============================================================================
// ACTION ENDPOINTS
// ============================================================================
export const actionsEndpoint = createEndpointsNodes({
  // GET /api/actions
  // Liste des actions (selon l'utilisateur (client ou banque))
  getAll: () =>
    queryOptions({
      queryKey: ['actions', 'list'],
      queryFn: () =>
        get('/actions').then((data) => {
          return safeParseWithLog(actionSchema.array(), data);
        }),
    }),

  // GET /api/actions
  // Liste des actions (selon l'utilisateur (client ou banque))
  get: ({ isin }: { isin: ActionId }) =>
    queryOptions({
      queryKey: ['actions', isin],
      queryFn: () =>
        get(`/actions/${isin}`).then((data) => {
          return safeParseWithLog(actionSchema, data);
        }),
    }),

  // POST /api/actions
  // Créer une nouvelle action
  create: () =>
    mutationOptions({
      mutationFn: async ({ payload }: { payload: NewAction }) => {
        const data = await post('/actions', payload);
        return actionSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
      },
    }),

  // PATCH /api/actions/:actionIsin
  // Modifier une action
  update: ({ actionIsin }: { actionIsin: ActionId }) =>
    mutationOptions({
      mutationFn: async ({ payload }: { payload: NewAction }) => {
        const data = await patch(`/actions/${actionIsin}`, payload);
        return actionSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['actions', actionIsin] });
        queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
      },
    }),

  // GET /api/actions
  // Liste des actions (selon l'utilisateur (client ou banque))
  getHistory: ({ isin }: { isin: ActionId }) =>
    queryOptions({
      queryKey: ['actions', isin, 'history'],
      queryFn: () =>
        get(`/actions/${isin}/history`).then((data) => {
          return safeParseWithLog(actionPriceHistorySchema.array(), data);
        }),
    }),
  // GET /api/actions
  // Liste des actions (selon l'utilisateur (client ou banque))
  getStats: ({ isin }: { isin: ActionId }) =>
    queryOptions({
      queryKey: ['actions', isin, 'stats'],
      queryFn: () =>
        get(`/actions/${isin}/stats`).then((data) => {
          return safeParseWithLog(actionStatsSchema, data);
        }),
    }),

  buy: ({ isin }: { isin: ActionId }) =>
    mutationOptions({
      mutationFn: async ({ payload }: { payload: BuyAction }) => {
        const data = await post(`/actions/${isin}/buy`, payload);
        return buyActionSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['actions', isin] });
      },
    }),

  sell: ({ isin }: { isin: ActionId }) =>
    mutationOptions({
      mutationFn: async ({ payload }: { payload: BuyAction }) => {
        const data = await post(`/actions/${isin}/sell`, payload);
        return buyActionSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['actions', isin] });
      },
    }),

  getSuggestions: () =>
    queryOptions({
      queryKey: ['actions', 'suggestions'],
      queryFn: async () =>
        get('/actions/suggestions').then((data) => safeParseWithLog(actionSchema.array(), data)),
    }),
});
