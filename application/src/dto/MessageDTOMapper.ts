import { MessageWithUser } from "@application/ports/repositories/MessageRepository";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { UserToFront } from "@domain/entities/UserEntity";

export type MessageEntityWithUsersDTO = MessageEntity & {
  sender: UserToFront;
};

export class MessageDTOMapper {
  static map(message: MessageWithUser): MessageEntityWithUsersDTO {
    return Object.assign(message, {
      sender: message.sender.toFront(),
    });
  }
  static maps(messages: MessageWithUser[]): MessageEntityWithUsersDTO[] {
    return messages.map((message) => this.map(message));
  }
}
