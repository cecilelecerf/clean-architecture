import { orderDTOSchema, orderSchema } from "@infrastructure/types/order";
import z from "zod";
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { safeParseWithLog } from "@/lib/zodUtils";
import { ActionId } from "@infrastructure/types/action";

// ============================================================================
// SCHEMAS
// ============================================================================

export const placeOrderSchema = orderSchema.pick({
  actionId: true, 
  type: true, 
  quantity:true
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
          return safeParseWithLog(orderDTOSchema.array(), data);
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
  // POST /api/orders
  // Créer un nouveau ordre d'achat ou de vente
  create: () =>
    mutationOptions({
      mutationFn: async (payload: placeOrder) => {
        console.log(payload);
        const data = await post('/orders', payload);
        return orderSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      },
    }),
})