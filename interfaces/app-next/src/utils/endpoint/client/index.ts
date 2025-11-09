import { threadSchema } from '@infrastructure/types/thread';
import { messageSchema } from '@infrastructure/types/message';
import { userDtoSchema } from '@infrastructure/types/user';
import z from 'zod';
import { accountsEndpoint } from './accountEndpoints';
import { threadsEndpoint } from './threadEndpoints';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { feedsEndpoint } from './feedsEndpoint';

const getMessageSchema = threadSchema.extend({
  messages: messageSchema.array(),
  administrator: userDtoSchema,
  participants: userDtoSchema.array(),
});
export type GetMessage = z.infer<typeof getMessageSchema>;
export const clientEndpoints = createEndpointsNodes({
  accounts: accountsEndpoint,
  threads: threadsEndpoint,
  feeds: feedsEndpoint,
});
