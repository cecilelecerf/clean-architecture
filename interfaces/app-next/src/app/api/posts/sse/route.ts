// app/api/posts/feed/route.ts
import { getServerSession } from 'next-auth';
import { Post } from '@infrastructure/types/feed';
import { authOptions } from '../../auth/[...nextauth]/route';
import { UserId } from '@infrastructure/types/user';
import { sseManager } from './sse-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface PostEvent {
  type: 'publish_post' | 'unpublish_post' | 'connected';
  post?: Post;
  timestamp?: Date;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  console.log('🔑 User connecting with ID:', {
    userId,
    userIdType: typeof userId,
    userIdLength: userId.length,
  });

  const stream = new ReadableStream({
    start(controller) {
      sseManager.addConnection(userId, controller);

      const data = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          clearInterval(heartbeat);
          sseManager.removeConnection(userId);
        }
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        sseManager.removeConnection(userId);
      });
    },
    cancel() {
      sseManager.removeConnection(userId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export function broadcastPostEvent(userId: string, event: PostEvent) {
  sseManager.broadcast(userId, event);
}
