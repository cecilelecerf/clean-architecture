import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { usersEndpoint } from './usersEndpoint';
import { threadsEndpoint } from './threadsEndpoint';
import { feedsEndpoint } from './feedsEndpoint';

export const advisorEndpoint = createEndpointsNodes({
  users: usersEndpoint,
  thread: threadsEndpoint,
  feeds: feedsEndpoint,
});
