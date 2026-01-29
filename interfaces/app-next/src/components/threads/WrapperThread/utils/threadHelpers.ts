import { MessageId, MessageWithUserDTO } from '@infrastructure/types/thread';
import { UserDto, UserId } from '@infrastructure/types/user';

/**
 * Met à jour les messages en ajoutant un utilisateur dans readBy
 */
export const markMessagesAsReadInList = (
  messages: MessageWithUserDTO[],
  messageIds: MessageId[],
  userId: UserId,
): MessageWithUserDTO[] => {
  return messages.map((msg) => {
    if (messageIds.includes(msg.id) && !msg.readBy.includes(userId)) {
      return {
        ...msg,
        readBy: [...msg.readBy, userId],
      };
    }
    return msg;
  });
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
}): Map<string, UserDto[]> => {
  const lastReadMap = new Map<string, UserDto[]>();

  allParticipants
    .filter((participant) => participant.id !== currentUserId)
    .forEach(({ id: participantId }) => {
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        const hasRead = msg.readByUsers?.some((r) => r.user.id === participantId);

        if (hasRead) {
          const reader = msg.readByUsers!.find((r) => r.user.id === participantId)!;

          if (!lastReadMap.has(msg.id)) {
            lastReadMap.set(msg.id, []);
          }

          lastReadMap.get(msg.id)!.push(reader.user);

          break;
        }
      }
    });

  return lastReadMap;
};
