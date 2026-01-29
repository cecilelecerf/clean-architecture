import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { threadsEndpoint, ThreadWithUserAndLastMsg } from '@/utils/endpoint/threadEndpoints';
import { MessageId, MessageWithUserDTO, Thread, ThreadId } from '@infrastructure/types/thread';
import { socket } from '@/lib/socket';
import { UserId } from '@infrastructure/types/user';
import { queryClient } from '@/lib/queryClient';

interface UseMessageReadProps {
  thread: Thread;
  userId: UserId;
  messages: MessageWithUserDTO[];
   onMessagesMarked: (messageIds: MessageId[], readAt : Date) => void;
}

export const useMessageRead = ({
  thread,
  userId,
  messages, 
  onMessagesMarked,
}: UseMessageReadProps) => {
   const isMarkingRef = useRef(false);
  const lastMarkTimeRef = useRef<number>(0);

  const readMessage = useMutation(threadsEndpoint.messages.read({ threadId: thread.id }));

  const hasUnreadMessages = useCallback(() => {
    return messages.some((msg) => msg.senderId !== userId && !msg.readBy.includes(userId));
  }, [messages, userId]);

  const markMessagesAsRead = useCallback(() => {
    if (isMarkingRef.current) {
      return;
    }

    if (!hasUnreadMessages()) {
      return;
    }

    const now = Date.now();
    if (now - lastMarkTimeRef.current < 2000) {
      return;
    }

    isMarkingRef.current = true;
    lastMarkTimeRef.current = now;

    readMessage.mutate(undefined, {
      onSuccess: (data) => {
        if (!data.messageIds || data.messageIds.length === 0) {
          isMarkingRef.current = false;
          return;
        }
         queryClient.setQueryData(['threads', 'list', thread.type], (oldData: ThreadWithUserAndLastMsg[]) => {
          if (!oldData) return oldData;
console.log(oldData)
          return oldData.map((oldThread: ThreadWithUserAndLastMsg) => {
            if(oldThread.id !==thread.id) return oldThread
            return {
              ...oldThread,
              lastMessage: {
                ...oldThread.lastMessage,
                readBy: [...oldThread.lastMessage.readBy, userId],
              },
            };
          });
        });
        if (socket) {
           socket.emit('thread:messages_marked_read', {
           threadId : thread.id,
            messageIds: data.messageIds,
            userId,
            readAt: data.readAt
          });
        }

        onMessagesMarked(data.messageIds, new Date(data.readAt));

        isMarkingRef.current = false;
      },
    });
  }, [readMessage, userId, thread.id, hasUnreadMessages, onMessagesMarked]);

  return {
    markMessagesAsRead,
    hasUnreadMessages,
    isMarking: readMessage.isPending,
  };
};
