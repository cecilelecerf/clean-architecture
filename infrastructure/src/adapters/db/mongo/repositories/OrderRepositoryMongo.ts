import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { MongoClient } from "../../MongoClient";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderModel } from "../models/OrderModel";
import { Money } from "@domain/values/Money";

export class OrderRepositoryMongo implements OrderRepository {
    constructor(private readonly client: MongoClient) {}
    
    async save(order: OrderEntity): Promise<void> {
        await this.client.connect();
                                
        await OrderModel.create({
            userId: order.userId,
            actionId: order.actionId,
            type: order.type,
            quantity: order.quantity,
            price: {
                amount: order.price.amount,
                currency: order.price.currency,
            },
            fee: {
                amount: order.fee.amount,
                currency: order.fee.currency,
            },
            date: order.date,
            status: order.status,
            createdAt: order.createdAt
        } as any);
    }

    async findById(id: OrderEntity["id"]): Promise<OrderEntity | null> {
        await this.client.connect();
                
        const doc = await OrderModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        const price = Money.create(doc.price);
        if (price instanceof Error) throw price;

        const fee = Money.create(doc.fee);
        if (fee instanceof Error) throw fee;
        
        return OrderEntity.from({
            id,
            userId: doc.userId,
            actionId: doc.actionId,
            type: doc.type,
            quantity: doc.quantity,
            price,
            fee,
            date: doc.date,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]> {
        await this.client.connect();
                
        const docs = await OrderModel.find({ userId }).lean();

        return docs.map((doc) => {
            const price = Money.create(doc.price);
            if (price instanceof Error) throw price;

            const fee = Money.create(doc.fee);
            if (fee instanceof Error) throw fee;

            return OrderEntity.from({
                id: doc._id.toString(),
                userId: doc.userId,
                actionId: doc.actionId,
                type: doc.type,
                quantity: doc.quantity,
                price,
                fee,
                date: doc.date,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt ?? null,
            });
        })
    }

    async findAllByActionId(actionId: ActionEntity["ISIN"]): Promise<OrderEntity[]> {
        await this.client.connect();
                
        const docs = await OrderModel.find({ actionId }).lean();

        return docs.map((doc) => {
            const price = Money.create(doc.price);
            if (price instanceof Error) throw price;

            const fee = Money.create(doc.fee);
            if (fee instanceof Error) throw fee;

            return OrderEntity.from({
                id: doc._id.toString(),
                userId: doc.userId,
                actionId: doc.actionId,
                type: doc.type,
                quantity: doc.quantity,
                price,
                fee,
                date: doc.date,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt ?? null,
            });
        })
    }

    async findAllOpen(): Promise<OrderEntity[]> {
        await this.client.connect();

        const docs = await OrderModel.find({ status: "pending" }).lean();

        return docs.map((doc) => {
            const price = Money.create(doc.price);
            if (price instanceof Error) throw price;

            const fee = Money.create(doc.fee);
            if (fee instanceof Error) throw fee;

            return OrderEntity.from({
                id: doc._id.toString(),
                userId: doc.userId,
                actionId: doc.actionId,
                type: doc.type,
                quantity: doc.quantity,
                price,
                fee,
                date: doc.date,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt ?? null,
            });
        })
    }

    async update(order: OrderEntity): Promise<void> {
        await this.client.connect();
                                
        await OrderModel.updateOne(
            { _id: order.id },
            {
                $set: {
                    userId: order.userId,
                    actionId: order.actionId,
                    type: order.type,
                    quantity: order.quantity,
                    price: {
                        amount: order.price.amount,
                        currency: order.price.currency,
                    },
                    fee: {
                        amount: order.fee.amount,
                        currency: order.fee.currency,
                    },
                    date: order.date,
                    status: order.status,
                    updatedAt: order.updatedAt || new Date(),
                },
            }
        );
    }

    async delete(id: OrderEntity["id"]): Promise<void> {
        await this.client.connect();
                                
        await OrderModel.deleteOne({ _id: id });
    }
}