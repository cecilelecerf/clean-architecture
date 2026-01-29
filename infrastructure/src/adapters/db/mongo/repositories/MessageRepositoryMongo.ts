import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MongoClient } from "../../MongoClient";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { MessageModel } from "../models/MessageModel";
import { UserMapper } from "../../mappers/UserMapper";
import { MessageMapper } from "../../mappers/MessageMapper";

export class MessageRepositoryMongo implements MessageRepository {
  constructor(private readonly client: MongoClient) {}

  /** 📬 Sauvegarder un message */
  async save(message: MessageEntity): Promise<void> {
    await this.client.connect();

    await MessageModel.create({
      _id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      content: message.content,
      sentAt: message.sentAt,
      readBy: message.readBy,
    });

    // Assurer que l'expéditeur est marqué comme ayant lu le message
    if (!message.readBy.includes(message.senderId)) {
      message.readBy.push(message.senderId);
      await MessageModel.updateOne(
        { _id: message.id },
        { $set: { readBy: message.readBy } },
      );
    }
  }

  async findAllWithUserByThread(threadId: string): Promise<MessageWithUser[]> {
    await this.client.connect();

    const docs = await MessageModel.find({ threadId })
      .populate({ path: "senderId" })
      .sort({ sentAt: 1 })
      .lean<any[]>();

    return docs.map((doc): MessageWithUser => {
      const message = MessageMapper.mapDocToMessage(doc);
      const sender = UserMapper.mapDocToUser(doc.senderId);
      return Object.assign(message, { sender });
    });
  }
}
