import { orderSchema } from "@infrastructure/types/order";
import z from "zod";
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions } from '@tanstack/react-query';
import { post } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';

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