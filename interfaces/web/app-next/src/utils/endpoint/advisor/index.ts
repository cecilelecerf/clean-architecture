import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { usersEndpoint } from './usersEndpoint';
import { threadsEndpoint as clientsThreadEndpoint } from './threadsEndpoint';

export const advisorEndpoint = createEndpointsNodes({
  users: usersEndpoint,
  clientsThread: clientsThreadEndpoint,
});
