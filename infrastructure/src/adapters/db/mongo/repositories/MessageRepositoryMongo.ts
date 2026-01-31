import {
  MessageRepository,
  MessageWithUser,
} from "@application/ports/repositories/MessageRepository";
import { MongoClient } from "../../MongoClient";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { MessageModel } from "../models/MessageModel";
import { UserMapper } from "../../mappers/UserMapper";
import { MessageMapper } from "../../mappers/MessageMapper";
import { ThreadEntity } from "@domain/entities/ThreadEntity";

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
      readBy: [
        {
          userId: message.senderId,
          readAt: message.sentAt,
        },
      ],
    });
  }

  async findAllWithUserByThread(
    threadId: ThreadEntity["id"],
  ): Promise<MessageWithUser[]> {
    await this.client.connect();

    const docs = await MessageModel.aggregate([
      { $match: { threadId } },

      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },

      {
        $unwind: {
          path: "$readBy",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "readBy.userId",
          foreignField: "_id",
          as: "readBy.user",
        },
      },

      {
        $unwind: {
          path: "$readBy.user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          threadId: { $first: "$threadId" },
          senderId: { $first: "$senderId" },
          content: { $first: "$content" },
          sentAt: { $first: "$sentAt" },
          sender: { $first: "$sender" },
          readByUsers: {
            $push: {
              $cond: [
                { $ifNull: ["$readBy.user", false] },
                {
                  user: "$readBy.user",
                  readAt: "$readBy.readAt",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },

      { $sort: { sentAt: 1 } },
    ]);

    return docs.map((doc): MessageWithUser => {
      const message = MessageEntity.from({
        id: doc._id,
        threadId: doc.threadId,
        senderId: doc.senderId,
        content: doc.content,
        sentAt: new Date(doc.sentAt),
        readBy: doc.readByUsers?.map((r: any) => r.user._id) || [doc.senderId],
      });

      const sender = UserMapper.mapDocToUser(doc.sender);

      const readByUsers = (doc.readByUsers || []).map((r: any) => ({
        user: UserMapper.mapDocToUser(r.user),
        readAt: new Date(r.readAt),
      }));

      return Object.assign(message, { sender, readByUsers });
    });
  }

  /** 🔍 Trouver un message par ID */
  async findById(id: MessageEntity["id"]): Promise<MessageEntity | null> {
    await this.client.connect();

    const doc = await MessageModel.findById(id).lean();

    if (!doc) return null;

    return MessageEntity.from({
      id: doc._id.toString(),
      threadId: doc.threadId,
      senderId: doc.senderId,
      content: doc.content,
      sentAt: new Date(doc.sentAt),
      readBy: doc.readBy?.map((r: any) => r.userId) || [doc.senderId],
    });
  }

  async findUnreadUpTo(
    threadId: string,
    userId: string,
    sentAt: Date,
  ): Promise<MessageEntity[]> {
    await this.client.connect();

    const docs = await MessageModel.find({
      threadId,
      sentAt: { $lte: sentAt },
      senderId: { $ne: userId }, // Pas envoyé par l'utilisateur
      "readBy.userId": { $ne: userId }, // Pas lu par l'utilisateur
    })
      .sort({ sentAt: 1 })
      .lean();

    return docs.map((doc) =>
      MessageEntity.from({
        id: doc._id.toString(),
        threadId: doc.threadId,
        senderId: doc.senderId,
        content: doc.content,
        sentAt: new Date(doc.sentAt),
        readBy: doc.readBy?.map((r: any) => r.userId) || [doc.senderId],
      }),
    );
  }

  /** ✅ Mettre à jour plusieurs messages (marquer comme lus) */
  async updateMany(messages: MessageEntity[], now: Date): Promise<void> {
    await this.client.connect();

    for (const message of messages) {
      // Récupérer le document actuel
      const currentDoc = await MessageModel.findById(message.id).lean();

      if (!currentDoc) continue;

      // Identifier les nouveaux lecteurs
      const existingReaders =
        currentDoc.readBy?.map((r: any) => r.userId) || [];
      const newReaders = message.readBy.filter(
        (userId) => !existingReaders.includes(userId),
      );

      if (newReaders.length > 0) {
        // Ajouter les nouveaux lecteurs avec readAt
        await MessageModel.updateOne(
          { _id: message.id },
          {
            $push: {
              readBy: {
                $each: newReaders.map((userId) => ({
                  userId,
                  readAt: now,
                })),
              },
            },
          },
        );
      }
    }
  }
}
