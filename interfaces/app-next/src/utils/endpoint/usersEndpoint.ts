import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, post } from '@/lib/apiClient';
import { User, userDtoSchema, UserId } from '@infrastructure/types/user';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { RegisterAdminPayload } from '@/app/api/users/new/route';
import { ReqBanUser } from '@/app/api/users/[userId]/ban/route';
import { queryClient } from '@/lib/queryClient';

export const usersEndpoint = createEndpointsNodes({
  // ============================================================================
  // QUERIES
  // ============================================================================

  getAll: ({ role }: { role?: User['role'] }) =>
    queryOptions({
      queryKey: ['users', 'list', role ?? 'all'],
      queryFn: () => {
        const roleParams = role ? `?role=${role}` : '';
        return get(`/users${roleParams}`).then((data) =>
          safeParseWithLog(userDtoSchema.array(), data),
        );
      },
    }),

  get: ({ id }: { id: UserId }) =>
    queryOptions({
      queryKey: ['users', id],
      queryFn: () => get(`/users/${id}`).then((data) => userDtoSchema.parse(data)),
    }),

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  create: () =>
    mutationOptions({
      mutationFn: ({ payload }: { payload: RegisterAdminPayload }) =>
        post('/users/new', payload).then((data) => userDtoSchema.parse(data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      },
    }),

  ban: ({ id }: { id: UserId }) =>
    mutationOptions({
      mutationFn: ({ status }: ReqBanUser) =>
        post(`/users/${id}/ban`, { status }).then((data) => userDtoSchema.parse(data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users', id] });
        queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      },
    }),
});
