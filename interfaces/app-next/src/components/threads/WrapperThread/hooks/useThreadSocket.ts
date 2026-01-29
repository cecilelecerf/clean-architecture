import { useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { MessageWithUserDTO, MessageId, ThreadId } from '@infrastructure/types/thread';
import { UserId } from '@infrastructure/types/user';

interface UseThreadSocketProps {
  threadId: ThreadId;
  userId: UserId;
  onNewMessage: (message: MessageWithUserDTO) => void;
  onMessagesRead: (messageIds: MessageId[], readerId: UserId) => void;
}

export const useThreadSocket = ({
  threadId,
  userId,
  onNewMessage,
  onMessagesRead,
}: UseThreadSocketProps) => {
  const handleNewMessage = useCallback(
    (msg: MessageWithUserDTO) => {
      onNewMessage(msg);
    },
    [onNewMessage],
  );

  const handleMessagesRead = useCallback(
    ({ messageIds, userId: readerId }: { messageIds: MessageId[]; userId: UserId }) => {
      console.log(messageIds);
      console.log(readerId);
      if (readerId === userId) return;

      onMessagesRead(messageIds, readerId);
    },
    [onMessagesRead, userId],
  );

  useEffect(() => {
    if (!socket) return;

    socket.emit('thread:join', { threadId });

    const newMessageEvent = `thread:${threadId}:new_message`;
    const messagesReadEvent = `thread:${threadId}:messages_read`;

    socket.on(newMessageEvent, handleNewMessage);
    socket.on(messagesReadEvent, handleMessagesRead);

    return () => {
      socket.off(newMessageEvent);
      socket.off(messagesReadEvent);
    };
  }, [threadId, handleNewMessage, handleMessagesRead]);
};
