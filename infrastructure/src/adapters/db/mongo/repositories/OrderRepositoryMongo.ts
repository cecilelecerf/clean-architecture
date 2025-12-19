import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { MongoClient } from "../../MongoClient";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderModel } from "../models/OrderModel";
import { Money } from "@domain/values/Money";

export class OrderRepositoryMongo implements OrderRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToOrder(doc: any): OrderEntity {
    const price = Money.from(doc.price);
    const fee = Money.from(doc.fee);

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
      updatedAt: doc.updatedAt,
    });
  }

  /** Sauvegarder un ordre */
  async save(order: OrderEntity): Promise<void> {
    await this.client.connect();

    await OrderModel.create({
      _id: order.id,
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
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }

  /** Trouver un ordre par ID */
  async findById(id: OrderEntity["id"]): Promise<OrderEntity | null> {
    await this.client.connect();

    const doc = await OrderModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToOrder(doc);
  }

  /** Tous les ordres d'un utilisateur */
  async findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]> {
    await this.client.connect();

    const docs = await OrderModel.find({ userId }).sort({ date: -1 }).lean();

    return docs.map((doc) => this.mapDocToOrder(doc));
  }

  /** Tous les ordres d'une action */
  async findAllByActionId(
    actionId: ActionEntity["ISIN"]
  ): Promise<OrderEntity[]> {
    await this.client.connect();

    const docs = await OrderModel.find({ actionId }).sort({ date: -1 }).lean();

    return docs.map((doc) => this.mapDocToOrder(doc));
  }

  /** Ordres en attente */
  async findAllOpen(): Promise<OrderEntity[]> {
    await this.client.connect();

    const docs = await OrderModel.find({ status: "pending" })
      .sort({ date: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToOrder(doc));
  }

  /** Mettre à jour un ordre */
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
          updatedAt: order.updatedAt,
        },
      }
    );
  }

  /** Supprimer un ordre */
  async delete(id: OrderEntity["id"]): Promise<void> {
    await this.client.connect();

    await OrderModel.deleteOne({ _id: id });
  }
}
