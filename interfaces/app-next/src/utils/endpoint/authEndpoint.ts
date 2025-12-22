import { mutationOptions } from '@tanstack/react-query';
import { post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { RegisterPayload } from '@/app/api/auth/register/route';
import { UserDto, userDtoSchema } from '@infrastructure/types/user';
import z from 'zod';
export const tokenSchema = z.object({
  token: z.string(),
});
type Token = z.infer<typeof tokenSchema>;

export const resetPasswordSchema = tokenSchema.extend({ password: z.string() });
type ResetPassword = z.infer<typeof resetPasswordSchema>;
export const authEndpoint = createEndpointsNodes({
  forgotPassword: () =>
    mutationOptions({
      mutationFn: async (email: UserDto['email']) => {
        const data = await post('/auth/forgot-password', { email });
        return data;
      },
    }),
  resetPassword: () =>
    mutationOptions({
      mutationFn: async (payload: ResetPassword) => {
        const data = await post('/auth/reset-password', payload);
        return safeParseWithLog(userDtoSchema, data);
      },
    }),
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
