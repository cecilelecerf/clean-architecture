import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MongoClient } from "../../MongoClient";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { MessageModel } from "../models/MessageModel";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { UserMapper } from "../../mappers/UserMapper";

export class MessageRepositoryMongo implements MessageRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToMessage(doc: any): MessageEntity {
    return MessageEntity.from({
      id: doc._id.toString(),
      threadId: doc.threadId?.toString() || doc.threadId,
      senderId: doc.senderId?.toString() || doc.senderId,
      content: doc.content,
      sentAt: doc.sentAt,
      readBy: doc.readBy || [],
    });
  }

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
        { $set: { readBy: message.readBy } }
      );
    }
  }

  /** 🔍 Tous les messages d'un thread */
  async findAllByThread(
    threadId: ThreadEntity["id"]
  ): Promise<MessageEntity[]> {
    await this.client.connect();

    const docs = await MessageModel.find({ threadId })
      .sort({ sentAt: 1 })
      .lean();

    return docs.map(this.mapDocToMessage);
  }

  /** 🔄 Mettre à jour un message */
  async update(message: MessageEntity): Promise<void> {
    await this.client.connect();

    // Met à jour le contenu et la liste des lecteurs
    await MessageModel.updateOne(
      { _id: message.id },
      {
        $set: {
          content: message.content,
          readBy: message.readBy,
        },
      }
    );
  }

  /** ❌ Supprimer un message */
  async delete(messageId: MessageEntity["id"]): Promise<void> {
    await this.client.connect();
    await MessageModel.deleteOne({ _id: messageId });
  }

  /** 🔍 Messages avec sender par thread */
  async findAllWithUserByThread(threadId: string): Promise<MessageWithUser[]> {
    await this.client.connect();

    const docs = await MessageModel.find({ threadId })
      .populate({ path: "senderId" }) // assure la population de sender
      .sort({ sentAt: 1 })
      .lean<any[]>();

    return docs.map((doc): MessageWithUser => {
      const message = this.mapDocToMessage(doc);
      const sender = UserMapper.mapDocToUser(doc.senderId);
      return Object.assign(message, { sender });
    });
  }
}
