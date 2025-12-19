import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { Thread, ThreadId, threadSchema } from '@infrastructure/types/thread';
import { userDtoSchema, UserId } from '@infrastructure/types/user';
import { messageWithUserSchema } from '@infrastructure/types/message';
import z from 'zod';
import { safeParseWithLog } from '@/lib/zodUtils';
import { queryClient } from '@/lib/queryClient';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { NewThread } from '@/app/api/threads/route';
import { AddParticipant } from '@/app/api/threads/[threadId]/transfer/route';

// ============================================================================
// SCHEMAS
// ============================================================================

export const threadWithUserSchema = threadSchema.extend({
  administrator: userDtoSchema.nullable(),
  participants: userDtoSchema.array(),
});

export type ThreadWithUser = z.infer<typeof threadWithUserSchema>;

export const threadWithAdminOnlySchema = threadSchema.extend({
  administrator: userDtoSchema.nullable(),
});

export type ThreadWithAdminOnly = z.infer<typeof threadWithAdminOnlySchema>;

// ============================================================================
// THREADS ENDPOINTS
// ============================================================================

export const threadsEndpoint = createEndpointsNodes({
  // GET /api/threads
  // Liste des threads selon le rôle + filtres optionnels
  getAll: ({ type }: { type?: Thread['type'] }) =>
    queryOptions({
      queryKey: ['threads', 'list', type],
      queryFn: () => {
        const params = new URLSearchParams();
        if (type) params.set('type', type);

        return get(`/threads?${params.toString()}`).then((data) =>
          safeParseWithLog(threadWithUserSchema.array(), data),
        );
      },
    }),

  // GET /api/threads/:threadId
  // Détails d'un thread avec admin et participants
  get: ({ threadId }: { threadId: ThreadId }) =>
    queryOptions({
      queryKey: ['threads', threadId],
      queryFn: () =>
        get(`/threads/${threadId}`).then((data) => safeParseWithLog(threadWithUserSchema, data)),
    }),

  // GET /api/threads/users/:userId
  // Threads d'un user spécifique
  getByUser: ({ userId }: { userId: UserId }) =>
    queryOptions({
      queryKey: ['threads', userId],
      queryFn: () =>
        get(`/threads/users/${userId}`).then((data) =>
          safeParseWithLog(threadWithAdminOnlySchema.array(), data),
        ),
    }),

  // GET /api/threads/users/:userI/client
  // Threads d'un user spécifique (conseiller/directeur)
  getByClient: ({ clientId }: { clientId: UserId }) =>
    queryOptions({
      queryKey: ['threads', clientId, 'client'],
      queryFn: () =>
        get(`/threads/users/${clientId}/client`).then((data) =>
          safeParseWithLog(threadWithAdminOnlySchema.array(), data),
        ),
    }),

  // POST /api/threads
  // Créer un nouveau thread (externe ou interne)
  create: ({ type }: { type: Thread['type'] }) =>
    mutationOptions({
      mutationFn: (data: NewThread) => {
        const params = new URLSearchParams();
        if (type) params.set('type', type);

        return post(`/threads?${params.toString()}`, data).then((data) =>
          safeParseWithLog(threadSchema, data),
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', 'list', type] });
      },
    }),

  // PATCH /api/threads/:threadId
  // Modifier un thread (titre, etc.)
  update: ({ threadId }: { threadId: ThreadId }) =>
    mutationOptions({
      mutationFn: (data: { title?: string }) => patch(`/threads/${threadId}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        queryClient.invalidateQueries({ queryKey: ['threads', 'list'] });
      },
    }),

  // POST /api/threads/:threadId/close
  // Fermer un thread
  close: ({ threadId }: { threadId: ThreadId }) =>
    mutationOptions({
      mutationFn: () => post(`/threads/${threadId}/close`, {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        queryClient.invalidateQueries({ queryKey: ['threads', 'list'] });
      },
    }),

  // POST /api/threads/:threadId/join
  // Rejoindre un thread (conseiller prend en charge un thread non assigné)
  join: ({ threadId }: { threadId: ThreadId }) =>
    mutationOptions({
      mutationFn: () => post(`/threads/${threadId}/join`, {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        queryClient.invalidateQueries({ queryKey: ['threads', 'list'] });
      },
    }),

  // POST /api/threads/:threadId/transfer
  // Transférer un thread à un autre conseiller
  transfer: ({ threadId }: { threadId: ThreadId }) =>
    mutationOptions({
      mutationFn: ({ newAdministratorId }: AddParticipant) =>
        post(`/threads/${threadId}/transfer`, { newAdministratorId }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        queryClient.invalidateQueries({ queryKey: ['threads', 'list'] });
      },
    }),

  // ============================================================================
  // MESSAGES
  // ============================================================================

  messages: {
    // GET /api/threads/:threadId/messages
    // Liste des messages d'un thread
    getAll: ({ threadId }: { threadId: ThreadId }) =>
      queryOptions({
        queryKey: ['threads', threadId, 'messages'],
        queryFn: () =>
          get(`/threads/${threadId}/messages`).then((data) =>
            safeParseWithLog(messageWithUserSchema.array(), data),
          ),
      }),

    // POST /api/threads/:threadId/messages
    // Envoyer un message dans un thread
    send: ({ threadId }: { threadId: ThreadId }) =>
      mutationOptions({
        mutationFn: (data: { content: string }) => post(`/threads/${threadId}/messages`, data),
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['threads', threadId, 'messages'],
          });
          // Mettre à jour la liste des threads (dernier message)
          queryClient.invalidateQueries({
            queryKey: ['threads', 'list'],
          });
        },
      }),
  },

  // ============================================================================
  // MESSAGES
  // ============================================================================

  participants: {
    // DELETE /api/threads/:threadId/participants/:userId
    // Supprtion d'un participant
    remove: ({ threadId }: { threadId: ThreadId }) =>
      mutationOptions({
        mutationFn: ({ userId }: { userId: UserId }) =>
          deleteEntity(`/threads/${threadId}/participants/${userId}`).then((data) =>
            safeParseWithLog(threadSchema, data),
          ),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        },
      }),

    // POST /api/threads/:threadId/messages
    // Envoyer un message dans un thread
    add: ({ threadId }: { threadId: ThreadId }) =>
      mutationOptions({
        mutationFn: ({ userId }: { userId: UserId }) =>
          post(`/threads/${threadId}/participants/${userId}`, {}).then((data) =>
            safeParseWithLog(threadSchema, data),
          ),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
        },
      }),
  },
});
