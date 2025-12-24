import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { deleteEntity, get, patch, post } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import {
  PostId,
  postSchema,
  TagId,
  tagIdSchema,
  tagSchema,
  tagToFrontSchema,
} from '@infrastructure/types/feed';
import z from 'zod';
import { queryClient } from '@/lib/queryClient';
import { userDtoSchema } from '@infrastructure/types/user';
import { paginationSchema } from '@infrastructure/types/pagination';

// ============================================================================
// SCHEMAS
// ============================================================================

export const postWithTagsAndUserSchema = postSchema.extend({
  tags: tagToFrontSchema.array(),
  advisor: userDtoSchema,
});
export type PostWithTagsAndUser = z.infer<typeof postWithTagsAndUserSchema>;

export const newPostSchema = postSchema.pick({
  title: true,
  content: true,
  tagsId: true,
});
export type NewPost = z.infer<typeof newPostSchema>;

export const newTagSchema = tagSchema.pick({
  color: true,
  label: true,
});
export type NewTag = z.infer<typeof newTagSchema>;

export const publishActionSchema = z.object({
  status: z.enum(['publish', 'unpublish']),
});
export type PublishAction = z.infer<typeof publishActionSchema>;

export const querySchema = paginationSchema.extend({
  tagsId: tagIdSchema.array().optional(),
  status: z.boolean().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  title: z.string().optional(),
});
export type PostFilters = z.infer<typeof querySchema>;

export const postsListResponseSchema = z.object({
  posts: postWithTagsAndUserSchema.array(),
  total: z.number(),
});
export type PostsListResponse = z.infer<typeof postsListResponseSchema>;

// ============================================================================
// QUERY KEYS
// ============================================================================

export const feedsQueryKeys = {
  all: ['feeds'] as const,
  posts: {
    all: () => [...feedsQueryKeys.all, 'posts'] as const,
    lists: () => [...feedsQueryKeys.posts.all(), 'list'] as const,
    list: (filters?: PostFilters) => [...feedsQueryKeys.posts.lists(), filters ?? {}] as const,
    details: () => [...feedsQueryKeys.posts.all(), 'detail'] as const,
    detail: (id: PostId) => [...feedsQueryKeys.posts.details(), id] as const,
    unread: () => [...feedsQueryKeys.posts.all(), 'unread'] as const,
  },
  tags: {
    all: () => [...feedsQueryKeys.all, 'tags'] as const,
    lists: () => [...feedsQueryKeys.tags.all(), 'list'] as const,
    list: () => [...feedsQueryKeys.tags.lists()] as const,
    details: () => [...feedsQueryKeys.tags.all(), 'detail'] as const,
    detail: (id: TagId) => [...feedsQueryKeys.tags.details(), id] as const,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildPostsQueryParams(filters?: PostFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

  if (filters.title) params.set('title', filters.title);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.tagsId?.length) params.set('tagsId', filters.tagsId.join(','));
  if (filters.fromDate) params.set('fromDate', filters.fromDate);
  if (filters.toDate) params.set('toDate', filters.toDate);
  if (filters.status !== undefined) params.set('status', String(filters.status));

  return params;
}

// ============================================================================
// INVALIDATION HELPERS
// ============================================================================

const invalidateHelpers = {
  invalidateAllPostsLists: () =>
    queryClient.invalidateQueries({
      queryKey: feedsQueryKeys.posts.lists(),
    }),

  invalidatePostDetail: (postId: PostId) =>
    queryClient.invalidateQueries({
      queryKey: feedsQueryKeys.posts.detail(postId),
    }),

  invalidateUnreadPosts: () =>
    queryClient.invalidateQueries({
      queryKey: feedsQueryKeys.posts.unread(),
    }),

  invalidateAllPostQueries: () =>
    queryClient.invalidateQueries({
      queryKey: feedsQueryKeys.posts.all(),
    }),
};

// ============================================================================
// ENDPOINTS
// ============================================================================

export const feedsEndpoint = createEndpointsNodes({
  posts: {
    getAll: ({ filters }: { filters?: PostFilters }) =>
      queryOptions({
        queryKey: feedsQueryKeys.posts.list(filters),
        queryFn: async () => {
          const params = buildPostsQueryParams(filters);
          const data = await get(`/posts?${params.toString()}`);
          return safeParseWithLog(postsListResponseSchema, data);
        },
      }),

    getUnread: () =>
      queryOptions({
        queryKey: feedsQueryKeys.posts.unread(),
        queryFn: async () => {
          const data = await get('/posts/unread');
          return safeParseWithLog(postWithTagsAndUserSchema.array(), data);
        },
      }),

    get: ({ id }: { id: PostId }) =>
      queryOptions({
        queryKey: feedsQueryKeys.posts.detail(id),
        queryFn: async () => {
          const data = await get(`/posts/${id}`);
          return postWithTagsAndUserSchema.parse(data);
        },
      }),

    markAsRead: () =>
      mutationOptions({
        mutationFn: async ({ postId }: { postId: PostId }) => {
          await patch(`/posts/${postId}/read`, {});
          return { postId };
        },
        onSuccess: async ({ postId }) => {
          await Promise.all([
            invalidateHelpers.invalidatePostDetail(postId),
            invalidateHelpers.invalidateUnreadPosts(),
            invalidateHelpers.invalidateAllPostsLists(),
          ]);
        },
      }),

    add: () =>
      mutationOptions({
        mutationFn: async (payload: NewPost) => {
          const data = await post('/posts', payload);
          return postSchema.parse(data);
        },
        onSuccess: async () => {
          await invalidateHelpers.invalidateAllPostsLists();
        },
      }),

    edit: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: async (payload: Partial<NewPost>) => {
          const data = await patch(`/posts/${id}`, payload);
          return postSchema.parse(data);
        },
        onSuccess: async () => {
          await Promise.all([
            invalidateHelpers.invalidatePostDetail(id),
            invalidateHelpers.invalidateAllPostsLists(),
          ]);
        },
      }),

    delete: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: async () => {
          await deleteEntity(`/posts/${id}`);
        },
        onSuccess: async () => {
          await Promise.all([
            invalidateHelpers.invalidatePostDetail(id),
            invalidateHelpers.invalidateAllPostsLists(),
          ]);
        },
      }),

    status: ({ id }: { id: PostId }) =>
      mutationOptions({
        mutationFn: async ({ status }: PublishAction) => {
          const data = await patch(`/posts/${id}/status`, { status });
          return postSchema.parse(data);
        },
        onSuccess: async () => {
          await Promise.all([
            invalidateHelpers.invalidatePostDetail(id),
            invalidateHelpers.invalidateAllPostsLists(),
          ]);
        },
      }),
  },

  tags: {
    getAll: () =>
      queryOptions({
        queryKey: feedsQueryKeys.tags.list(),
        queryFn: async () => {
          const data = await get('/tags');
          return safeParseWithLog(tagSchema.array(), data);
        },
      }),
  },
});
