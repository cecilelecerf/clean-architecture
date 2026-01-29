import { ThreadWithUser } from '@/utils/endpoint/threadEndpoints';
import { MessageId, MessageWithUserDTO, Thread } from '@infrastructure/types/thread';
import { UserDto, UserId } from '@infrastructure/types/user';
 
/**
 * Met à jour les messages en ajoutant un utilisateur dans readBy
 */
export const markMessagesAsReadInList = (
  messages: MessageWithUserDTO[],
  messageIds: MessageId[],
  userId: UserId,
  thread: ThreadWithUser,
  readAt : Date
): MessageWithUserDTO[]  => {
   messages.map((msg) => {
    if (messageIds.includes(msg.id) && !msg.readBy.includes(userId)) { 
      const allParticipants = [...thread.participants, thread.administrator]
      const user: UserDto = allParticipants.findLast((participant)=> participant.id === userId)
    return messages[messages.length-1]={
        ...msg,
        readBy: [...msg.readBy, userId],
        readByUsers: [...msg.readByUsers, {user, readAt: readAt.toISOString()}]
      }
     }
   else return msg;
  });
  return messages
};

/**
 * Compte les messages non lus pour un utilisateur
 */
export const countUnreadMessages = (messages: MessageWithUserDTO[], userId: UserId): number => {
  return messages.filter((msg) => msg.senderId !== userId && !msg.readBy.includes(userId)).length;
};

/**
 * Vérifie si un message est non lu pour un utilisateur
 */
export const isMessageUnread = (message: MessageWithUserDTO, userId: UserId): boolean => {
  return message.senderId !== userId && !message.readBy.includes(userId);
};

/**
 * Calcule pour chaque message, quels utilisateurs l'ont comme dernier message lu
 */
export const calculateLastReadByUsers = ({
  messages,
  currentUserId,
  allParticipants,
}: {
  messages: MessageWithUserDTO[];
  currentUserId: UserId;
  allParticipants: UserDto[];
}): Record<string, UserDto[]> => {
    const lastReadMap : Record<MessageId, UserDto[]>= {};
   allParticipants
    .filter((participant) => participant.id !== currentUserId)
    .forEach(({ id: participantId }) => {
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i]; 
        const hasRead = msg.readByUsers?.some((r) => r.user.id === participantId);
 
        if (hasRead) {
          const reader = msg.readByUsers!.find((r) => r.user.id === participantId)!;
 
          if (!Object.keys(lastReadMap).includes(msg.id)) lastReadMap[msg.id]= [];
          lastReadMap[msg.id]= [...lastReadMap[msg.id], reader.user]
 
          break;
        }
      }
    });
   return lastReadMap;
};
