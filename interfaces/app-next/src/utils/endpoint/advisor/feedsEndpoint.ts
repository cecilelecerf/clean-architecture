import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { PostId, postSchema, TagId, tagIdSchema, tagSchema } from '@infrastructure/types/feed';
import { queryClient } from '@/lib/queryClient';
import z from 'zod';
import { userDtoSchema } from '@infrastructure/types/user';

const postWithTagsAndUserSchema = postSchema.extend({
  tags: tagSchema.array(),
  advisor: userDtoSchema,
});
export type PostWithTagsAndUser = z.infer<typeof postWithTagsAndUserSchema>;
export const newPostSchema = postSchema.pick({ title: true, content: true, tagsId: true });
export type NewPost = z.infer<typeof newPostSchema>;

export const newTagSchema = tagSchema.pick({ color: true, label: true });
export type NewTag = z.infer<typeof newTagSchema>;

export const publishActionSchema = z.object({
  status: z.enum(['publish', 'unpublish']),
});
type PublishAction = z.infer<typeof publishActionSchema>;

const queryKeys = {
  posts: {
    list: (filters: FiltersProps) => ['posts', 'list', filters] as const,
    detail: (id: PostId) => ['posts', 'detail', id] as const,
  },
  tags: {
    list: ['tags', 'list'] as const,
    detail: (id: TagId) => ['tags', 'detail', id] as const,
  },
};

export const querySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  tagsId: tagIdSchema.array().optional(),
  status: z.boolean().optional(),
  fromDate: z.iso.datetime().optional(),
  toDate: z.iso.datetime().optional(),
  title: z.string().optional(),
});

export type FiltersProps = z.infer<typeof querySchema>;

export const feedsEndpoint = createEndpointsNodes({
  posts: {
    getAll: ({ filters }: { filters?: FiltersProps }) =>
      queryOptions({
        queryKey: queryKeys.posts.list(filters),
        queryFn: async () => {
          const params = new URLSearchParams();
          if (filters.page) params.set('page', String(filters.page));
          if (filters.limit) params.set('limit', String(filters.limit));
          if (filters.tagsId && filters.tagsId.length > 0)
            params.set('tagsId', filters.tagsId.join(','));
          if (typeof filters.status === 'boolean')
            params.set('status', filters.status ? 'true' : 'false');
          if (filters.fromDate) params.set('fromDate', filters.fromDate);
          if (filters.toDate) params.set('toDate', filters.toDate);
          return get(`/posts?${params.toString()}`, 'advisor').then((data) =>
            safeParseWithLog(
              z.object({ posts: postWithTagsAndUserSchema.array(), total: z.number() }),
              data,
            ),
          );
        },
      }),
    get: ({ id }: { id: PostId }) =>
      queryOptions({
        queryKey: queryKeys.posts.detail(id),
        queryFn: () =>
          get(`/posts/${id}`, 'advisor').then((data) => postWithTagsAndUserSchema.parse(data)),
      }),
    add: () =>
      mutationOptions({
        mutationFn: ({ ...payload }: NewPost) =>
          post(`/posts`, { ...payload }, 'advisor').then((data) => postSchema.parse(data)),
        onSuccess: () =>
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'list',
          }),
      }),
    edit: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: ({ ...payload }: Partial<NewPost>) =>
          patch(`/posts/${id}`, { ...payload }, 'advisor').then((data) => postSchema.parse(data)),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) }),
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'list',
            }),
          ]);
        },
      }),

    delete: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: () => deleteEntity(`/posts/${id}`, 'advisor'),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) }),
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'list',
            }),
          ]);
        },
      }),

    status: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: ({ status }: PublishAction) =>
          patch(`/posts/${id}/status`, { status }, 'advisor').then((data) =>
            postSchema.parse(data),
          ),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) }),
            queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'list',
            }),
          ]);
        },
      }),
  },
  tags: {
    getAll: () =>
      queryOptions({
        queryKey: queryKeys.tags.list,
        queryFn: () =>
          get('/tags', 'advisor').then((data) => safeParseWithLog(tagSchema.array(), data)),
      }),

    get: ({ id }: { id: TagId }) =>
      queryOptions({
        queryKey: queryKeys.tags.detail(id),
        queryFn: () => get(`/tags/${id}`, 'advisor').then((data) => tagSchema.parse(data)),
      }),

    add: () =>
      mutationOptions({
        mutationFn: ({ ...payload }: NewTag) =>
          post(`/tags/new`, { ...payload }, 'advisor').then((data) => tagSchema.parse(data)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags.list }),
      }),

    edit: ({ id }: { id: TagId }) =>
      mutationOptions({
        mutationFn: ({ ...payload }: Partial<NewTag>) =>
          patch(`/tags/${id}`, { ...payload }, 'advisor').then((data) => tagSchema.parse(data)),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.detail(id) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.list }),
          ]);
        },
      }),

    delete: ({ id }: { id: TagId }) =>
      mutationOptions({
        mutationFn: () => deleteEntity(`/tags/${id}`, 'advisor'),
        onSuccess: async () => {
          await Promise.all([
            queryClient.removeQueries({ queryKey: queryKeys.tags.detail(id) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.list }),
          ]);
        },
      }),
  },
});
