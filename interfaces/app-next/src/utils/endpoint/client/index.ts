import { accountsEndpoint } from './accountEndpoints';
import { threadsEndpoint } from './threadEndpoints';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { feedsEndpoint } from './feedsEndpoint';

export const clientEndpoints = createEndpointsNodes({
  accounts: accountsEndpoint,
  threads: threadsEndpoint,
  feeds: feedsEndpoint,
});
