import { accountsEndpoint } from './accountEndpoints';
import { threadsEndpoint } from './threadEndpoints';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { feedsEndpoint } from './feedsEndpoint';
import { usersEndpoint } from './usersEndpoint';
import { authEndpoint } from './authEndpoint';
import { savingsrateEndpoint } from './savingsrateEndpoints';

export const endpoints = createEndpointsNodes({
  accounts: accountsEndpoint,
  threads: threadsEndpoint,
  feeds: feedsEndpoint,
  users: usersEndpoint,
  auth: authEndpoint,
  savingrate: savingsrateEndpoint
});
