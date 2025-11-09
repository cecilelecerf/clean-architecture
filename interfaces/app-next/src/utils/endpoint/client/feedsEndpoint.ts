import { queryOptions } from '@tanstack/react-query';
import { get } from '@/lib/apiClient';
import { safeParseWithLog } from '@/lib/zodUtils';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { PostId, TagId, tagIdSchema, tagSchema } from '@infrastructure/types/feed';
import z from 'zod';
import { postWithTagsAndUserSchema } from '../advisor/feedsEndpoint';

export const feedsQueryKeys = {
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
          return get(`/posts?${params.toString()}`, 'client').then((data) =>
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
          get(`/posts/${id}`, 'client').then((data) => postWithTagsAndUserSchema.parse(data)),
      }),
  },
  tags: {
    getAll: () =>
      queryOptions({
        queryKey: feedsQueryKeys.tags.list,
        queryFn: () =>
          get('/tags', 'client').then((data) => safeParseWithLog(tagSchema.array(), data)),
      }),
  },
});
