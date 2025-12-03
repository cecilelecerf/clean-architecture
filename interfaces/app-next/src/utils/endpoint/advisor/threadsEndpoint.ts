import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
import { userDtoSchema, UserId } from '@infrastructure/types/user';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { ThreadId, threadSchema } from '@infrastructure/types/thread';
import { threadsWithMessageAndUserSchema } from '../client/threadEndpoints';
import { queryClient } from '@/lib/queryClient';

export const threadsEndpoint = createEndpointsNodes({
  getAll: () =>
    queryOptions({
      queryKey: ['client-threads', 'list'],
      queryFn: () =>
        get('/client-threads', 'advisor').then((data) => {
          return safeParseWithLog(
            threadSchema
              .extend({
                administrator: userDtoSchema.nullable(),
                participants: userDtoSchema.array(),
              })
              .array(),
            data,
          );
        }),
    }),
  get: ({ id }: { id: ThreadId }) =>
    queryOptions({
      queryKey: ['client-threads', id],
      queryFn: () =>
        get(`/client-threads/${id}`, 'advisor').then((data) =>
          threadsWithMessageAndUserSchema.parse(data),
        ),
    }),
  join: ({ id }: { id: ThreadId }) =>
    mutationOptions({
      mutationFn: () =>
        post(`/client-threads/${id}/join`, {}, 'advisor').then((data) =>
          threadsWithMessageAndUserSchema.parse(data),
        ),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-threads', id] }),
    }),
});
