import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { Thread } from '@infrastructure/types/thread';

export function useThreadSocket(threads: Thread[] | undefined) {
  useEffect(() => {
    if (!threads) return;

    const threadIds = threads.map((thread) => thread.id);

    threadIds.forEach((threadId) => {
      socket.emit('thread:join', { threadId });
    });

    return () => {
      threadIds.forEach((threadId) => {
        socket.emit('thread:leave', { threadId });
      });
    };
  }, [threads]);
}
