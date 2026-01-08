import {
  BuyAction,
  OrderId,
  orderSchema,
  portfolioPositionSchema,
  portfolioSchema,
} from '@infrastructure/types/order';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { ActionId, actionSchema } from '@infrastructure/types/action';
import { queryClient } from '@/lib/queryClient';
import { OrderEntity } from '@domain/entities/OrderEntity';

// ============================================================================
// SCHEMAS
// ============================================================================

export const placeOrderSchema = orderSchema.pick({
  actionId: true,
  type: true,
  quantity: true,
});
export type placeOrder = z.infer<typeof placeOrderSchema>;

// ============================================================================
// ORDERS ENDPOINTS
// ============================================================================

export const ordersEndpoint = createEndpointsNodes({
  // GET /api/orders
  // Liste des ordre d'achat ou de vent d'action selon l'utilisateur (client ou banque)
  getAllByUser: () =>
    queryOptions({
      queryKey: ['orders', 'list'],
      queryFn: () =>
        get('/orders').then((data) => {
          return safeParseWithLog(orderSchema.extend({ action: actionSchema }).array(), data);
        }),
    }),

  cancelled: ({ orderId }: { orderId: OrderId }) =>
    mutationOptions({
      mutationFn: async ({}: {}) =>
        patch(`/orders/${orderId}/cancelled`, {}).then((data) =>
          safeParseWithLog(orderSchema, data),
        ),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['order', data.ISIN, 'me', 'pending'] });
      },
    }),

  // GET /api/orders/actions/:actionId
  // Liste des ordre d'achat ou de vent d'action selon l'action

  actions: {
    getAllMeByAction: ({ ISIN, status }: { ISIN: ActionId; status?: OrderEntity['status'] }) =>
      queryOptions({
        queryKey: ['orders', ISIN, 'me', status],
        queryFn: () =>
          get(`/orders/actions/${ISIN}?${status && `status=${status}`}`).then((data) => {
            return safeParseWithLog(orderSchema.array(), data);
          }),
      }),
    placeOrder: ({ ISIN, type }: { ISIN: ActionId; type: OrderEntity['type'] }) =>
      mutationOptions({
        mutationFn: async ({ payload }: { payload: BuyAction }) =>
          post(`/orders/actions/${ISIN}/${type}`, payload).then((data) =>
            safeParseWithLog(orderSchema, data),
          ),
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['actions', ISIN] });
          queryClient.invalidateQueries({
            queryKey: ['accounts', data.IBAN, 'transactions', 'list'],
          });
          queryClient.invalidateQueries({ queryKey: ['accounts', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['accounts', data.IBAN] });
          queryClient.invalidateQueries({ queryKey: ['portfolio', 'me'] });
          queryClient.invalidateQueries({ queryKey: ['portfolio', ISIN] });
          queryClient.invalidateQueries({ queryKey: ['order', ISIN, 'list'] });
        },
      }),
    portfolio: ({ ISIN }: { ISIN: ActionId }) =>
      queryOptions({
        queryKey: ['portfolio', ISIN],
        queryFn: () =>
          get(`/orders/actions/${ISIN}/portfolio`).then((data) => {
            return safeParseWithLog(portfolioPositionSchema.or(z.null()), data);
          }),
      }),
    getHistory: ({ isin }: { isin: ActionId }) =>
      queryOptions({
        queryKey: ['orders', isin, 'history'],
        queryFn: () =>
          get(`/orders/actions/${isin}/history`).then((data) => {
            return safeParseWithLog(orderSchema.array(), data);
          }),
      }),
  },

  portfolio: {
    getMe: () =>
      queryOptions({
        queryKey: ['portfolio', 'me'],
        queryFn: () =>
          get(`/orders/portfolio`).then((data) => {
            return safeParseWithLog(portfolioSchema, data);
          }),
      }),
  },
});
