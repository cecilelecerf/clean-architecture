import { MessageWithUser } from "@application/ports/repositories/MessageRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { UserToDTO } from "@domain/entities/UserEntity";

export type MessageEntityWithUsersDTO = MessageEntity & {
  sender: UserToDTO;
};

export class MessageDTOMapper {
  static map(message: MessageWithUser): MessageEntityWithUsersDTO {
    return Object.assign(message, {
      sender: message.sender.toDTO(),
    });
  }
  static maps(messages: MessageWithUser[]): MessageEntityWithUsersDTO[] {
    return messages.map((message) => this.map(message));
  }
}
