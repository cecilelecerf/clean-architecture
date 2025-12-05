import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { createEndpointsNodes } from '../createEndpointNode';
import { get, post } from '@/lib/apiClient';
import { AccountId, accountSchema } from '@infrastructure/types/account';
import { Thread, ThreadId, threadSchema } from '@infrastructure/types/thread';
import { messageSchema } from '@infrastructure/types/message';
import { userDtoSchema } from '@infrastructure/types/user';
import z from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';
import { accountsEndpoint } from './accountEndpoints';
import { NewThread } from '@/app/api/client/threads/route';
import { queryClient } from '@/lib/queryClient';

const getMessageSchema = threadSchema.extend({
  messages: messageSchema.array(),
  administrator: userDtoSchema,
  participants: userDtoSchema.array(),
});
export type GetMessage = z.infer<typeof getMessageSchema>;
export const threadsEndpoint = createEndpointsNodes({
  getAll: () =>
    queryOptions({
      queryKey: ['threads', 'list'],
      queryFn: () =>
        get('/threads', 'client').then((data) => {
          return safeParseWithLog(
            threadSchema.extend({ administrator: userDtoSchema }).array(),
            data,
          );
        }),
    }),
  get: ({ id }: { id: ThreadId }) =>
    queryOptions({
      queryKey: ['threads', id],
      queryFn: () =>
        get(`/threads/${id}`, 'client').then((data) => {
          return safeParseWithLog(getMessageSchema, data);
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
