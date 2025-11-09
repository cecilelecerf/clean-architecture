import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { PostId, postSchema, TagId, tagSchema } from '@infrastructure/types/feed';
import { queryClient } from '@/lib/queryClient';
import z from 'zod';
import { userDtoSchema } from '@infrastructure/types/user';
import { feedsQueryKeys, FiltersProps } from '../client/feedsEndpoint';

export const postWithTagsAndUserSchema = postSchema.extend({
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

export const feedsEndpoint = createEndpointsNodes({
  posts: {
    getAll: ({ filters }: { filters?: FiltersProps }) =>
      queryOptions({
        queryKey: feedsQueryKeys.posts.list(filters),
        queryFn: () => {
          const params = new URLSearchParams();
          if (filters.title) params.set('title', filters.title);
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
        queryKey: feedsQueryKeys.posts.detail(id),
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
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.posts.detail(id) }),
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
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.posts.detail(id) }),
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
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.posts.detail(id) }),
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
        queryKey: feedsQueryKeys.tags.list,
        queryFn: () =>
          get('/tags', 'advisor').then((data) => safeParseWithLog(tagSchema.array(), data)),
      }),

    get: ({ id }: { id: TagId }) =>
      queryOptions({
        queryKey: feedsQueryKeys.tags.detail(id),
        queryFn: () => get(`/tags/${id}`, 'advisor').then((data) => tagSchema.parse(data)),
      }),

    add: () =>
      mutationOptions({
        mutationFn: ({ ...payload }: NewTag) =>
          post(`/tags/new`, { ...payload }, 'advisor').then((data) => tagSchema.parse(data)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: feedsQueryKeys.tags.list }),
      }),

    edit: ({ id }: { id: TagId }) =>
      mutationOptions({
        mutationFn: ({ ...payload }: Partial<NewTag>) =>
          patch(`/tags/${id}`, { ...payload }, 'advisor').then((data) => tagSchema.parse(data)),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.tags.detail(id) }),
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.tags.list }),
          ]);
        },
      }),

    delete: ({ id }: { id: TagId }) =>
      mutationOptions({
        mutationFn: () => deleteEntity(`/tags/${id}`, 'advisor'),
        onSuccess: async () => {
          await Promise.all([
            queryClient.removeQueries({ queryKey: feedsQueryKeys.tags.detail(id) }),
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.tags.list }),
          ]);
        },
      }),
  },
});
