import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
import { Thread, ThreadId, threadSchema } from '@infrastructure/types/thread';
import { userDtoSchema } from '@infrastructure/types/user';
import z from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';
import { NewThread } from '@/app/api/client/threads/route';
import { queryClient } from '@/lib/queryClient';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { messageWithUserSchema } from '@infrastructure/types/message';

export const threadsWithUserSchema = threadSchema.extend({
  administrator: userDtoSchema.nullable(),
  participants: userDtoSchema.array(),
});
export type ThreadWithUser = z.infer<typeof threadsWithUserSchema>;
export const threadsEndpoint = createEndpointsNodes({
  messages: {
    getAll: ({ id }: { id: ThreadId }) =>
      queryOptions({
        queryKey: ['thread', id, 'messages', 'list'],
        queryFn: () =>
          get(`/threads/${id}/messages`, 'client').then((data) =>
            safeParseWithLog(messageWithUserSchema.array(), data),
          ),
      }),
  },
  getAll: () =>
    queryOptions({
      queryKey: ['threads', 'list'],
      queryFn: () =>
        get('/threads', 'client').then((data) => {
          return safeParseWithLog(
            threadSchema.extend({ administrator: userDtoSchema.nullable() }).array(),
            data,
          );
        }),
    }),
  get: ({ id }: { id: ThreadId }) =>
    queryOptions({
      queryKey: ['threads', id],
      queryFn: () =>
        get(`/threads/${id}`, 'client').then((data) => {
          return safeParseWithLog(threadsWithUserSchema, data);
        }),
    }),
  post: () =>
    mutationOptions({
      mutationFn: (data: NewThread) => post<Thread, NewThread>('/threads', data, 'client'),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', 'list'] });
      },
    }),
});
