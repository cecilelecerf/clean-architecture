import { queryOptions } from '@tanstack/react-query';
import { get } from '@/lib/apiClient';
import { AccountId, accountSchema } from '@infrastructure/types/account';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';

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
