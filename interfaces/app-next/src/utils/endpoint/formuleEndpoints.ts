import {
  formuleDTOSchema,
  FormuleId,
  formuleSchema,
  formuleStatSchema,
  formuleTypesSchema,
} from '@infrastructure/types/formule';
import z from 'zod';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';

// ============================================================================
// SCHEMAS
// ============================================================================

export const newFormuleSchema = formuleSchema.pick({
  interestRate: true,
  insuranceRate: true,
  type: true,
  label: true,
  description: true,
  accountId: true,
  minAmount: true,
  maxAmount: true,
  currency: true,
});
export type NewFormule = z.infer<typeof newFormuleSchema>;

export const updateFormuleSchema = formuleSchema.pick({
  interestRate: true,
  insuranceRate: true,
  type: true,
  label: true,
  description: true,
  minAmount: true,
  maxAmount: true,
  currency: true,
  isActive: true,
});
export type UpdateFormule = z.infer<typeof updateFormuleSchema>;

// ============================================================================
// FORMULE ENDPOINTS
// ============================================================================

export const formuleEndpoint = createEndpointsNodes({
  get: ({ formuleId }: { formuleId: FormuleId }) =>
    queryOptions({
      queryKey: ['formules', formuleId],
      queryFn: () => get(`/formules/${formuleId}`).then((data) => formuleDTOSchema.parse(data)),
    }),

  getAll: () =>
    queryOptions({
      queryKey: ['formules', 'list'],
      queryFn: () =>
        get(`/formules`).then((data) => safeParseWithLog(formuleDTOSchema.array(), data)),
    }),

  getAllActive: () =>
    queryOptions({
      queryKey: ['formules', 'list', 'active'],
      queryFn: () =>
        get(`/formules/active`).then((data) => safeParseWithLog(formuleDTOSchema.array(), data)),
    }),

  getTypes: () =>
    queryOptions({
      queryKey: ['formules', 'types', 'list'],
      queryFn: async () =>
        get(`/formules/type`).then((data) => safeParseWithLog(formuleTypesSchema.array(), data)),
    }),

  // POST /api/formules
  // Créer un nouveau taux d'interet
  create: () =>
    mutationOptions({
      mutationFn: async (payload: NewFormule) => {
        const data = await post('/formules', payload);
        return formuleSchema.parse(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['formules', 'list'] });
      },
    }),

  // PATCH /api/formules/:formuleId
  update: ({ formuleId }: { formuleId: FormuleId }) =>
    mutationOptions({
      mutationFn: (payload: UpdateFormule) => patch(`/formules/${formuleId}`, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['formules', formuleId] });
        queryClient.invalidateQueries({ queryKey: ['formules', 'list'] });
      },
    }),

  stats: ({ id }: { id: FormuleId }) =>
    queryOptions({
      queryKey: ['formules', id, 'stats'],
      queryFn: async () =>
        get(`/formules/${id}/stats`).then((data) => safeParseWithLog(formuleStatSchema, data)),
    }),
});
