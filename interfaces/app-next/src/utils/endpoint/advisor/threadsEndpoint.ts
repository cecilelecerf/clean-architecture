import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
import { userDtoSchema } from '@infrastructure/types/user';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { ThreadId, threadSchema } from '@infrastructure/types/thread';
import { threadsWithUserSchema } from '../client/threadEndpoints';
import { queryClient } from '@/lib/queryClient';
import { messageWithUserSchema } from '@infrastructure/types/message';

export const threadsEndpoint = createEndpointsNodes({
  messages: {
    getAll: ({ id }: { id: ThreadId }) =>
      queryOptions({
        queryKey: ['client-threads', id, 'messages', 'list'],
        queryFn: () =>
          get(`/client-threads/${id}/messages`, 'advisor').then((data) =>
            safeParseWithLog(messageWithUserSchema.array(), data),
          ),
      }),
  },
  client: {
    getAll: () =>
      queryOptions({
        queryKey: ['client-threads', 'list'],
        queryFn: () =>
          get('/client-threads', 'advisor').then((data) => {
            return safeParseWithLog(threadsWithUserSchema.array(), data);
          }),
      }),
    get: ({ id }: { id: ThreadId }) =>
      queryOptions({
        queryKey: ['client-threads', id],
        queryFn: () =>
          get(`/client-threads/${id}`, 'advisor').then((data) => threadsWithUserSchema.parse(data)),
      }),
    join: ({ id }: { id: ThreadId }) =>
      mutationOptions({
        mutationFn: async () => await post(`/client-threads/${id}/join`, {}, 'advisor'),
        onSuccess: () => {
          return queryClient.invalidateQueries({
            queryKey: ['client-threads', id],
            refetchType: 'active',
          });
        },
      }),
  },
});
