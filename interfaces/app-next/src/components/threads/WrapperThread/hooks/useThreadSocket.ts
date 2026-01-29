import { useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';
import { MessageWithUserDTO, MessageId, ThreadId } from '@infrastructure/types/thread';
import { UserId } from '@infrastructure/types/user';

interface UseThreadSocketProps {
  threadId: ThreadId;
  userId: UserId;
  onNewMessage: (message: MessageWithUserDTO) => void;
  onMessagesRead: (messageIds: MessageId[], readerId: UserId, readAt : Date) => void;
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
    ({ messageIds, userId: readerId, readAt }: { messageIds: MessageId[]; userId: UserId, readAt : Date }) => { 
      if (readerId === userId) return;
       onMessagesRead(messageIds, readerId, new Date(readAt) );
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
