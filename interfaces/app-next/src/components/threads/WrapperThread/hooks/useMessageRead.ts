import { useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { threadsEndpoint, ThreadWithUserAndLastMsg } from '@/utils/endpoint/threadEndpoints';
import { MessageId, MessageWithUserDTO, Thread, ThreadId } from '@infrastructure/types/thread';
import { socket } from '@/lib/socket';
import { UserId } from '@infrastructure/types/user';
import { queryClient } from '@/lib/queryClient';

interface UseMessageReadProps {
  threadId: ThreadId;
  userId: UserId;
  messages: MessageWithUserDTO[];
  threadType: Thread['type'];
  onMessagesMarked: (messageIds: MessageId[]) => void;
}

export const useMessageRead = ({
  threadId,
  userId,
  messages,
  threadType,
  onMessagesMarked,
}: UseMessageReadProps) => {
  const isMarkingRef = useRef(false);
  const lastMarkTimeRef = useRef<number>(0);

  const readMessage = useMutation(threadsEndpoint.messages.read({ threadId }));

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
        console.log('on success');
        queryClient.setQueryData(['threads', 'list', threadType], (oldData: any) => {
          if (!oldData) return oldData;

          return oldData.map((thread: ThreadWithUserAndLastMsg) => {
            return {
              ...thread,
              lastMessage: {
                ...thread.lastMessage,
                readBy: [...thread.lastMessage.readBy, userId],
              },
            };
          });
        });
        if (socket) {
          socket.emit('thread:messages_marked_read', {
            threadId,
            messageIds: data.messageIds,
            userId,
          });
        }

        onMessagesMarked(data.messageIds);

        isMarkingRef.current = false;
      },
    });
  }, [readMessage, userId, threadId, hasUnreadMessages, onMessagesMarked]);

  return {
    markMessagesAsRead,
    hasUnreadMessages,
    isMarking: readMessage.isPending,
  };
};
