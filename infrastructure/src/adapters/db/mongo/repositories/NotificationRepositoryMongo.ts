import { NotificationRepository } from "@application/ports/repositories/NotificationRepository";
import { MongoClient } from "../../MongoClient";
import { NotificationEntity } from "@domain/entities/NotificationEntity";
import { NotificationModel } from "../models/NotificationModel";

export class NotificationRepositoryMongo implements NotificationRepository {
    constructor(private readonly client: MongoClient) {}

    async save(notification: NotificationEntity): Promise<void> {
        await this.client.connect();
                        
        await NotificationModel.create({
            advisorId: notification.advisorId,
            clientId: notification.clientId,
            title: notification.title,
            content: notification.content,
            isRead: notification.isRead,
            type: notification.type,
            createdAt: notification.createdAt
        } as any);
    }

    async findById(id: NotificationEntity["id"]): Promise<NotificationEntity | null> {
        await this.client.connect();
                
        const doc = await NotificationModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        return NotificationEntity.from({
            id: doc._id.toString(),
            advisorId: doc.advisorId,
            clientId: doc.clientId,
            title: doc.title,
            content: doc.content,
            isRead: doc.isRead,
            type: doc.type,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findAllByClientId(clientId: NotificationEntity["clientId"]): Promise<NotificationEntity[]> {
        await this.client.connect();
                
        const docs = await NotificationModel.find({ clientId }).lean();
        
        return docs.map((doc) => {
            return NotificationEntity.from({
                id: doc._id.toString(),
                advisorId: doc.advisorId,
                clientId: doc.clientId,
                title: doc.title,
                content: doc.content,
                isRead: doc.isRead,
                type: doc.type,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async findAllByAdvisorId(advisorId: NotificationEntity["advisorId"]): Promise<NotificationEntity[]> {
        await this.client.connect();
                
        const docs = await NotificationModel.find({ advisorId }).lean();

        return docs.map((doc) => {
            return NotificationEntity.from({
                id: doc._id.toString(),
                advisorId: doc.advisorId,
                clientId: doc.clientId,
                title: doc.title,
                content: doc.content,
                isRead: doc.isRead,
                type: doc.type,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async findRecentByClientId(clientId: NotificationEntity["clientId"],limit: number = 10): Promise<NotificationEntity[]> {
        await this.client.connect();
                
        const docs = await NotificationModel.find({ clientId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return docs.map((doc) => {
            return NotificationEntity.from({
                id: doc._id.toString(),
                advisorId: doc.advisorId,
                clientId: doc.clientId,
                title: doc.title,
                content: doc.content,
                isRead: doc.isRead,
                type: doc.type,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async update(notification: NotificationEntity): Promise<void> {
        await this.client.connect();
                        
        await NotificationModel.updateOne(
            { _id: notification.id },
            {
                $set: {
                    advisorId: notification.advisorId,
                    clientId: notification.clientId,
                    title: notification.title,
                    content: notification.content,
                    isRead: notification.isRead,
                    type: notification.type,
                    updatedAt: notification.updatedAt || new Date(),
                },
            }
        );
    }

    async delete(id: NotificationEntity["id"]): Promise<void> {
        await this.client.connect();
                        
        await NotificationModel.deleteOne({ _id: id });
    }
}