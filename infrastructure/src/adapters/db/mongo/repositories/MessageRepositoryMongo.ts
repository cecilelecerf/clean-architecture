import { MessageRepository } from "@application/ports/repositories/MessageRepository";
import { MongoClient } from "../../MongoClient";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { MessageModel } from "../models/MessageModel";
import { UserEntity } from "@domain/entities/UserEntity";

export class MessageRepositoryMongo implements MessageRepository {
    constructor(private readonly client: MongoClient) {}

    async save(message: MessageEntity): Promise<void> {
        await this.client.connect();
                        
        await MessageModel.create({
            threadId: message.threadId,
            senderId: message.senderId,
            content: message.content,
            sentAt: message.sentAt,
            readBy: message.readBy
        } as any);
    }

    async findAllByThread(threadId: ThreadEntity["id"]): Promise<MessageEntity[]> {
        await this.client.connect();
                
        const docs = await MessageModel.find({ threadId }).lean();

        return docs.map((doc) => {
            return MessageEntity.from({
                id: doc._id.toString(),
                threadId: doc.threadId,
                senderId: doc.senderId,
                content: doc.content,
                sentAt: doc.sentAt,
                readBy: doc.readBy
            });
        })
    }

    async update(message: MessageEntity): Promise<void> {
        await this.client.connect();
                        
        await MessageModel.updateOne(
            { _id: message.id },
            {
                $set: {
                    threadId: message.threadId,
                    senderId: message.senderId,
                    content: message.content,
                    sentAt: message.sentAt,
                    readBy: message.readBy,
                },
            }
        );

        const existingDoc = await MessageModel.findById(message.id).lean();
        if (!existingDoc) return;

        const existingUserReadIds = existingDoc.readBy || [];

        const usersToAdd = message.readBy.filter((id) => !existingUserReadIds.includes(id));
        if (usersToAdd.length > 0) {
            await MessageModel.updateOne(
                { _id: message.id },
                { $addToSet: { readBy: { $each: usersToAdd } } }
            );
        }

        const usersToRemove = existingUserReadIds.filter((id) => !message.readBy.includes(id));
        if (usersToRemove.length > 0) {
            await MessageModel.updateOne(
                { _id: message.id },
                { $pull: { readBy: { $in: usersToRemove } } }
            );
        }

    }

    async delete(messageId: MessageEntity["id"]): Promise<void> {
        await this.client.connect();
                        
        await MessageModel.deleteOne({ _id: messageId });
    }

    // TODO: fix error
    async findAllWithUserByThread(threadId: string): Promise<MessageWithUser[]> {
        await this.client.connect();

        const docs = await MessageModel.find({ threadId })
            .sort({ sentAt: 1 })
            .populate<{ sender: any }>("senderId")
            .lean();

        // const userIds = Array.from(new Set(docs.map(d => d.senderId)));
        // const users = await UserModel.find({ _id: { $in: userIds } }).lean();
        // const usersMap = new Map(users.map(u => [u._id.toString(), u]));

        return docs.map((doc) => {
            const message = MessageEntity.from({
                id: doc._id.toString(),
                threadId: doc.threadId,
                senderId: doc.senderId,
                content: doc.content,
                sentAt: doc.sentAt,
                readBy: doc.readBy || [],
            });

            // const senderDoc = usersMap.get(doc.senderId);
            // if (!senderDoc) throw new Error(`User ${doc.senderId} not found`); 
            // const sender = UserEntity.from({
            //     id: senderDoc._id.toString(),
            //     firstname: senderDoc.firstname,
            //     lastname: senderDoc.lastname,
            //     email: senderDoc.email,
            //     passwordHash: senderDoc.passwordHash,
            //     role: senderDoc.role,
            //     isActiveField: senderDoc.isActive,
            //     createdAt: senderDoc.createdAt,
            //     confirmedAt: senderDoc.confirmedAt,
            //     modifiedAt: senderDoc.updatedAt,
            // });

            // return Object.assign(message, { sender });
        });
    }

}