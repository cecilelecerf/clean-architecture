import { mutationOptions } from '@tanstack/react-query';
import { post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { RegisterPayload } from '@/app/api/auth/register/route';
import { userDtoSchema, userSchema } from '@infrastructure/types/user';
import z from 'zod';
export const tokenSchema = z.object({
  token: z.string(),
});
type Token = z.infer<typeof tokenSchema>;
export const authEndpoint = createEndpointsNodes({
  confirmEmail: () =>
    mutationOptions({
      mutationFn: async (payload: Token) => {
        const data = await post('/auth/confirm-email', payload);
        return safeParseWithLog(userDtoSchema, data);
      },
    }),
  register: () =>
    mutationOptions({
      mutationFn: async (payload: RegisterPayload) => {
        const data = await post('/auth/register', payload);
        return safeParseWithLog(userDtoSchema, data);
      },
    }),
});
