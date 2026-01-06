import {
  BuyAction,
  orderSchema,
  portfolioPositionSchema,
  portfolioSchema,
} from '@infrastructure/types/order';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
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

  // GET /api/orders/actions/:actionId
  // Liste des ordre d'achat ou de vent d'action selon l'action

  actions: {
    getAllByAction: ({ ISIN, status }: { ISIN: ActionId; status?: OrderEntity['status'] }) =>
      queryOptions({
        queryKey: ['orders', ISIN],
        queryFn: () =>
          get(`/orders/actions/${ISIN}?${status && `status=${status}`}`).then((data) => {
            return safeParseWithLog(orderSchema.array(), data);
          }),
      }),

    // getAllWithAction: () =>
    //   queryOptions({
    //     queryKey: ['orders', 'list', 'actions'],
    //     queryFn: () =>
    //       get(`/orders/actions`).then((data) => {
    //         return safeParseWithLog(orderSchema.array(), data);
    //       }),
    //   }),
    placeOrder: ({ ISIN, type }: { ISIN: ActionId; type: OrderEntity['type'] }) =>
      mutationOptions({
        mutationFn: async ({ payload }: { payload: BuyAction }) =>
          post(`/orders/actions/${ISIN}/${type}`, payload).then((data) =>
            safeParseWithLog(orderSchema, data),
          ),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['actions', ISIN] });
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          queryClient.invalidateQueries({ queryKey: ['order', 'portfolio'] });
        },
      }),
  },

  portfolio: {
    getMe: () =>
      queryOptions({
        queryKey: ['portfolio', 'me'],
        queryFn: () =>
          get(`/portfolio`).then((data) => {
            return safeParseWithLog(portfolioSchema, data);
          }),
      }),
    getByISIN: ({ ISIN }: { ISIN: ActionId }) =>
      queryOptions({
        queryKey: ['portfolio', ISIN],
        queryFn: () =>
          get(`/portfolio/${ISIN}`).then((data) => {
            return safeParseWithLog(portfolioPositionSchema.or(z.null()), data);
          }),
      }),
  },
});
