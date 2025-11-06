import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { PostId, postSchema, TagId, tagSchema } from '@infrastructure/types/feed';
import { queryClient } from '@/lib/queryClient';
import z from 'zod';

const postWithTagsSchema = postSchema.extend({ tags: tagSchema.array() });
export const newPostSchema = postSchema.pick({ title: true, content: true, tagsId: true });
export type NewPost = z.infer<typeof newPostSchema>;

export const newTagSchema = tagSchema.pick({ color: true, label: true });
export type NewTag = z.infer<typeof newTagSchema>;

export const publishActionSchema = z.object({
  action: z.enum(['publish', 'unpublish']),
});
type PublishAction = z.infer<typeof publishActionSchema>;

const queryKeys = {
  posts: {
    list: ['posts', 'list'] as const,
    detail: (id: PostId) => ['posts', 'detail', id] as const,
  },
  tags: {
    list: ['tags', 'list'] as const,
    detail: (id: TagId) => ['tags', 'detail', id] as const,
  },
};

export const threadsEndpoint = createEndpointsNodes({
  posts: {
    getAll: () =>
      queryOptions({
        queryKey: queryKeys.posts.list,
        queryFn: () =>
          get('/posts', 'advisor').then((data) => {
            return safeParseWithLog(
              z.object({ posts: postWithTagsSchema.array(), page: z.number() }),
              data,
            );
          }),
      }),
    get: ({ id }: { id: PostId }) =>
      queryOptions({
        queryKey: queryKeys.posts.detail(id),
        queryFn: () =>
          get(`/posts/${id}`, 'advisor').then((data) => postWithTagsSchema.parse(data)),
      }),
    add: ({ ...payload }: NewPost) =>
      mutationOptions({
        mutationFn: () =>
          post(`/posts`, { ...payload }, 'advisor').then((data) => postSchema.parse(data)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.posts.list }),
      }),
    edit: ({ id, ...payload }: Partial<NewPost> & { id: PostId }) =>
      mutationOptions({
        mutationFn: () =>
          patch(`/posts/${id}`, { ...payload }, 'advisor').then((data) => postSchema.parse(data)),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.list }),
          ]);
        },
      }),

    delete: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: () => deleteEntity(`/posts/${id}`, 'advisor'),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.list }),
          ]);
        },
      }),

    action: ({ id, action }: { id: PostId } & PublishAction) =>
      mutationOptions({
        mutationFn: () =>
          patch(`/posts/${id}/publish`, { action }, 'advisor').then((data) =>
            postSchema.parse(data),
          ),
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) }),
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.list }),
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

    add: ({ ...payload }: NewTag) =>
      mutationOptions({
        mutationFn: () =>
          post(`/tags/new`, { ...payload }, 'advisor').then((data) => tagSchema.parse(data)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags.list }),
      }),

    edit: ({ id, ...payload }: Partial<NewTag> & { id: TagId }) =>
      mutationOptions({
        mutationFn: () =>
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
