import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, patch, post } from '@/lib/apiClient';
import { Action, ActionId, actionSchema } from '@infrastructure/types/action';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { queryClient } from '@/lib/queryClient';

// ============================================================================
// ACTION ENDPOINTS
// ============================================================================
export const actionEndpoint = createEndpointsNodes({
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

  // POST /api/actions
  // Créer une nouvelle action
  create: () =>
    mutationOptions({
      mutationFn: async (payload: Action) => {
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
      mutationFn: async (payload: Action) => {
        const data = await patch(`/actions/${actionIsin}`, payload);
        return actionSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['actions', actionIsin] });
        queryClient.invalidateQueries({ queryKey: ['actions', 'list'] });
      },
    }),
});
