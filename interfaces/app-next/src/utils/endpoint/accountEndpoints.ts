import { queryOptions } from '@tanstack/react-query';
import { get } from '@/lib/apiClient';
import { AccountId, accountSchema } from '@infrastructure/types/account';
import { threadSchema } from '@infrastructure/types/thread';
import { messageSchema } from '@infrastructure/types/message';
import { userDtoSchema } from '@infrastructure/types/user';
import z from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';

const getMessageSchema = threadSchema.extend({
  messages: messageSchema.array(),
  administrator: userDtoSchema,
  participants: userDtoSchema.array(),
});
export type GetMessage = z.infer<typeof getMessageSchema>;
export const accountsEndpoint = createEndpointsNodes({
  getAll: () =>
    queryOptions({
      queryKey: ['accounts', 'list'],
      queryFn: () =>
        get('/accounts').then((data) => {
          return safeParseWithLog(accountSchema.array(), data);
        }),
    }),
  get: ({ id }: { id: AccountId }) =>
    queryOptions({
      queryKey: ['accounts', id],
      queryFn: () => get(`/accounts/${id}`).then((data) => accountSchema.parse(data)),
    }),
});
