import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { usersEndpoint } from './usersEndpoint';
import { threadsEndpoint as clientsThreadEndpoint } from './threadsEndpoint';
import { feedsEndpoint } from './feedsEndpoint';

export const advisorEndpoint = createEndpointsNodes({
  users: usersEndpoint,
  clientsThread: clientsThreadEndpoint,
  feeds: feedsEndpoint,
});
