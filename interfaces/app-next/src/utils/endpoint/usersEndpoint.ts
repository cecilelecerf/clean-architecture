import { queryOptions } from '@tanstack/react-query';
import { get } from '@/lib/apiClient';
import { User, UserId, userSchema } from '@infrastructure/types/user';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';

export const usersEndpoint = createEndpointsNodes({
  getAll: ({ role }: { role?: User['role'] }) =>
    queryOptions({
      queryKey: ['users', 'list', role ?? 'all'],
      queryFn: () => {
        const roleParams = !!role ? `?role=${role}` : '';
        return get(`/users${roleParams}`).then((data) => {
          return safeParseWithLog(userSchema.array(), data);
        });
      },
    }),
  get: ({ id }: { id: UserId }) =>
    queryOptions({
      queryKey: ['users', id],
      queryFn: () => get(`/users/${id}`).then((data) => userSchema.parse(data)),
    }),
});
