import { queryOptions } from '@tanstack/react-query';
import { get } from '@/lib/apiClient';
import { UserId, userSchema } from '@infrastructure/types/user';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';

export const usersEndpoint = createEndpointsNodes({
  getAll: () =>
    queryOptions({
      queryKey: ['users', 'list'],
      queryFn: () =>
        get('/users', 'advisor').then((data) => {
          return safeParseWithLog(userSchema.array(), data);
        }),
    }),
  get: ({ id }: { id: UserId }) =>
    queryOptions({
      queryKey: ['users', id],
      queryFn: () => get(`/users/${id}`, 'advisor').then((data) => userSchema.parse(data)),
    }),
});
