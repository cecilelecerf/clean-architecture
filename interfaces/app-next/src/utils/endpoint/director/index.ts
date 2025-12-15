import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { threadsEndpoint } from './threadEndpoints';

export const directorEndpoints = createEndpointsNodes({
  threads: threadsEndpoint,
});
