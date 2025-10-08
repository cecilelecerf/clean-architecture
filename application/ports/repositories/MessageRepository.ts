import { MessageEntity } from "@domain/entities/MessageEntity";

export interface MessageRepository {
  addMessage(message: MessageEntity): Promise<void>;
}