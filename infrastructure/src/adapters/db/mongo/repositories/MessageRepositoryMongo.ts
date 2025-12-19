import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MongoClient } from "../../MongoClient";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { MessageModel } from "../models/MessageModel";
import { UserEntity } from "@domain/entities/UserEntity";

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

  private mapDocToSender(doc: any): UserEntity {
    return UserEntity.from({
      id: doc._id.toString(),
      firstname: doc.firstname,
      lastname: doc.lastname,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      isActiveField: doc.isActive,
      createdAt: doc.createdAt,
      confirmedAt: doc.confirmedAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** 📬 Sauvegarder un message */
  async save(message: MessageEntity): Promise<void> {
    await this.client.connect();

    await MessageModel.create({
      threadId: message.threadId,
      senderId: message.senderId,
      content: message.content,
      sentAt: message.sentAt,
      readBy: message.readBy,
    });
  }

  /** 🔍 Tous les messages d'un thread */
  async findAllByThread(
    threadId: ThreadEntity["id"]
  ): Promise<MessageEntity[]> {
    await this.client.connect();

    const docs = await MessageModel.find({ threadId })
      .sort({ sentAt: 1 })
      .lean();

    return docs.map((doc) => this.mapDocToMessage(doc));
  }

  /** 🔄 Mettre à jour un message */
  async update(message: MessageEntity): Promise<void> {
    await this.client.connect();

    await MessageModel.findByIdAndUpdate(
      message.id,
      {
        $set: {
          content: message.content,
          readBy: message.readBy,
        },
      },
      { new: true }
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
      .populate({
        path: "senderId",
      })
      .sort({ sentAt: 1 })
      .lean<any[]>();

    return docs.map((doc) => {
      const message = this.mapDocToMessage(doc);

      if (!doc.senderId) {
        throw new Error(`Sender not found for message ${doc._id}`);
      }

      const sender = this.mapDocToSender(doc.senderId);

      return Object.assign(message, { sender });
    });
  }
}
