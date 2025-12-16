import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { PostId, postSchema, TagId, tagIdSchema, tagSchema } from '@infrastructure/types/feed';
import z from 'zod';
 import { queryClient } from '@/lib/queryClient';
import { userDtoSchema } from '@infrastructure/types/user';


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

export const feedsQueryKeys = {
  posts: {
    list: (filters: FiltersProps) => ['posts', 'list', filters ?? {}] as const,
    unread: () => ['posts', 'unread'] as const,
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
        queryKey: feedsQueryKeys.posts.list(filters),
        queryFn: () => {
          const params = new URLSearchParams();
          if (filters.title) params.set('title', filters.title);
          if (filters.page) params.set('page', String(filters.page));
          if (filters.limit) params.set('limit', String(filters.limit));
          if (filters.tagsId && filters.tagsId.length > 0)
            params.set('tagsId', filters.tagsId.join(','));
          if (filters.fromDate) params.set('fromDate', filters.fromDate);
          if (filters.toDate) params.set('toDate', filters.toDate);
          return get(`/posts?${params.toString()}`).then((data) =>
            safeParseWithLog(
              z.object({ posts: postWithTagsAndUserSchema.array(), total: z.number() }),
              data,
            ),
          );
        },
      }),
    getUnread: () =>
      queryOptions({
        queryKey: feedsQueryKeys.posts.unread(),
        queryFn: () => {
          return get(`/posts/unread`).then((data) =>
            safeParseWithLog(postWithTagsAndUserSchema.array(), data),
          );
        },
      }),
    get: ({ id }: { id: PostId }) =>
      queryOptions({
        queryKey: feedsQueryKeys.posts.detail(id),
        queryFn: () =>
          get(`/posts/${id}`).then((data) => postWithTagsAndUserSchema.parse(data)),
      }),
    markAsRead: () =>
      mutationOptions({
        mutationFn: ({ postId }: { postId: PostId }) =>
          patch(`/posts/${postId}/read`, {}),
        onSuccess: async ({ postId }: { postId: PostId }) => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.posts.detail(postId) }),
            queryClient.invalidateQueries({ queryKey: feedsQueryKeys.posts.unread() }),
            queryClient.invalidateQueries({
              queryKey: ['posts', 'list'],
            }),
          ]);
        },
      }),

    add: () =>
      mutationOptions({
        mutationFn: ({ ...payload }: NewPost) =>
          post(`/posts`, { ...payload }).then((data) => postSchema.parse(data)),
        onSuccess: () =>
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'list',
          }),
      }),
    edit: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: ({ ...payload }: Partial<NewPost>) =>
          patch(`/posts/${id}`, { ...payload }).then((data) => postSchema.parse(data)),
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
        mutationFn: () => deleteEntity(`/posts/${id}`),
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
          patch(`/posts/${id}/status`, { status }).then((data) =>
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
          get('/tags').then((data) => safeParseWithLog(tagSchema.array(), data)),
      }),
  },
});
