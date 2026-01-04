import { orderDTOSchema, orderSchema, portfolioSchema } from '@infrastructure/types/order';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { queryOptions } from '@tanstack/react-query';
import { get } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { ActionId, actionSchema } from '@infrastructure/types/action';

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
          return safeParseWithLog(orderDTOSchema.extend({ action: actionSchema }).array(), data);
        }),
    }),

  // GET /api/orders/actions/:actionId
  // Liste des ordre d'achat ou de vent d'action selon l'action
  getAllByAction: ({ actionId }: { actionId: ActionId }) =>
    queryOptions({
      queryKey: ['orders', actionId],
      queryFn: () =>
        get(`/orders/actions/${actionId}`).then((data) => {
          return safeParseWithLog(orderDTOSchema.array(), data);
        }),
    }),

  getAllWithAction: () =>
    queryOptions({
      queryKey: ['orders', 'list', 'actions'],
      queryFn: () =>
        get(`/orders/actions`).then((data) => {
          return safeParseWithLog(orderDTOSchema.array(), data);
        }),
    }),
  getPortfolio: () =>
    queryOptions({
      queryKey: ['orders', 'portfolio'],
      queryFn: () =>
        get(`/orders/portfolio`).then((data) => {
          return safeParseWithLog(portfolioSchema, data);
        }),
    }),
});
