import { queryOptions } from '@tanstack/react-query';
import { createEndpointsNodes } from './createEndpointNode';
import { get } from '@/lib/apiClient';
import { AccountId, accountSchema } from '@infrastructure/types/account';
import { ThreadId, threadSchema } from '@infrastructure/types/thread';
import { messageSchema } from '@infrastructure/types/message';
import { userDtoSchema } from '@infrastructure/types/user';
import { safeParse } from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';

const messageWithUser = messageSchema.extend({ user: userDtoSchema });
export const clientEndpoints = createEndpointsNodes({
  accounts: {
    getAll: () =>
      queryOptions({
        queryKey: ['accounts', 'list'],
        queryFn: () =>
          get('/accounts', 'client').then((data) => {
            return safeParseWithLog(accountSchema.array(), data);
          }),
      }),
    get: ({ id }: { id: AccountId }) =>
      queryOptions({
        queryKey: ['accounts', id],
        queryFn: () => get(`/accounts/${id}`, 'client').then((data) => accountSchema.parse(data)),
      }),
  },
  threads: {
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
            return safeParseWithLog(
              threadSchema.extend({
                messages: messageSchema.array(),
                administrator: userDtoSchema,
                participants: userDtoSchema.array(),
              }),
              data,
            );
          }),
      }),
  },
});
