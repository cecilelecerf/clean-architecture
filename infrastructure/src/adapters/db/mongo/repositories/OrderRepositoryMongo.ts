import {
  OrderEntityWithAccount,
  OrderRepository,
} from "@application/ports/repositories/OrderRepository";
import { MongoClient } from "../../MongoClient";
import { OrderEntity } from "@domain/entities/OrderEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { OrderModel } from "../models/OrderModel";
import { Money } from "@domain/values/Money";
import { IBAN } from "@domain/values/IBAN";
import { ISIN } from "@domain/values/ISIN";
import { AccountModel } from "../models/AccountModel";
import { AccountMapper } from "../../mappers/AccountMapper";
import { cp } from "fs";

export class OrderRepositoryMongo implements OrderRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToOrder(doc: any): OrderEntity {
    return OrderEntity.from({
      id: doc._id.toString(),
      IBAN: IBAN.from(doc.IBAN),
      ISIN: ISIN.from(doc.ISIN),
      type: doc.type,
      quantity: doc.quantity,
      price: Money.from(doc.price),
      executionPrice: doc.executionPrice
        ? Money.from(doc.executionPrice)
        : undefined,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      date: doc.date,
      transactionId: doc.transactionId,
    });
  }

  async save(order: OrderEntity): Promise<void> {
    await this.client.connect();
    await OrderModel.create({
      _id: order.id,
      IBAN: order.IBAN.value,
      ISIN: order.ISIN.getValue(),
      type: order.type,
      quantity: order.quantity,
      price: {
        amount: order.price.amount,
        currency: order.price.currency,
      },
      executionPrice: order.executionPrice
        ? {
            amount: order.executionPrice.amount,
            currency: order.executionPrice.currency,
          }
        : undefined,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      date: order.date ?? null,
      transactionId: order.transactionId ?? null,
    });
  }

  async findById(id: OrderEntity["id"]): Promise<OrderEntity | null> {
    await this.client.connect();

    const doc = await OrderModel.findById(id).lean();
    if (!doc) return null;
    return this.mapDocToOrder(doc);
  }

  async findAllByUserId(userId: UserEntity["id"]): Promise<OrderEntity[]> {
    await this.client.connect();

    const accounts = await AccountModel.find({ userId }).select("_id").lean();
    const userIBANs = accounts.map((acc) => acc._id);

    const docs = await OrderModel.find({ IBAN: { $in: userIBANs } })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map(this.mapDocToOrder);
  }

  async findAllOpen(): Promise<OrderEntity[]> {
    await this.client.connect();
    const docs = await OrderModel.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(this.mapDocToOrder);
  }

  async update(order: OrderEntity): Promise<void> {
    await this.client.connect();
    await OrderModel.updateOne(
      { _id: order.id },
      {
        $set: {
          IBAN: order.IBAN.value,
          ISIN: order.ISIN.getValue(),
          type: order.type,
          quantity: order.quantity,
          price: {
            amount: order.price.amount,
            currency: order.price.currency,
          },
          executionPrice: order.executionPrice
            ? {
                amount: order.executionPrice.amount,
                currency: order.executionPrice.currency,
              }
            : undefined,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          date: order.date ?? null,
          transactionId: order.transactionId ?? null,
        },
      }
    );
  }

  async delete(id: OrderEntity["id"]): Promise<void> {
    await this.client.connect();
    await OrderModel.deleteOne({ _id: id });
  }

  async findAllByUserIdAndStatus(
    userId: UserEntity["id"],
    status: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    await this.client.connect();

    const accounts = await AccountModel.find({ userId }).select("_id").lean();
    const userIBANs = accounts.map((acc) => acc._id);
    const docs = await OrderModel.find({
      IBAN: { $in: userIBANs },
      status,
    })
      .sort({ type: 1 })
      .lean();

    return docs.map(this.mapDocToOrder);
  }

  async findAllByActionIdAndStatus(
    actionId: ActionEntity["ISIN"],
    status?: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    await this.client.connect();
    const filter: any = { ISIN: actionId.getValue() };
    if (status) filter.status = status;
    const docs = await OrderModel.find(filter).sort({ createdAt: 1 }).lean();
    return docs.map(this.mapDocToOrder);
  }

  async findAllExecutedByISINAndDateRange(
    actionId: ActionEntity["ISIN"],
    startDate: Date,
    endDate: Date
  ): Promise<OrderEntity[]> {
    await this.client.connect();
    const docs = await OrderModel.find({
      ISIN: actionId.getValue(),
      status: "executed",
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();
    return docs.map(this.mapDocToOrder);
  }

  async findAllByActionIdAndStatusAndUserId(
    actionId: ActionEntity["ISIN"],
    userId: UserEntity["id"],
    status?: OrderEntity["status"]
  ): Promise<OrderEntity[]> {
    await this.client.connect();

    const accounts = await AccountModel.find({ userId }).select("_id").lean();
    const userIBANs = accounts.map((acc) => acc._id);

    const filter: any = {
      ISIN: actionId.getValue(),
      IBAN: { $in: userIBANs },
    };
    if (status) filter.status = status;

    const docs = await OrderModel.find(filter).sort({ type: 1 }).lean();
    return docs.map(this.mapDocToOrder);
  }

  async findAllByActionIdAndStatusAndType(
    actionId: ActionEntity["ISIN"],
    status: OrderEntity["status"],
    type: OrderEntity["type"]
  ): Promise<OrderEntity[]> {
    await this.client.connect();
    const docs = await OrderModel.find({
      ISIN: actionId.getValue(),
      status,
      type,
    })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(this.mapDocToOrder);
  }

  async findPendingLimitOrders(
    actionId: ActionEntity["ISIN"]
  ): Promise<OrderEntity[]> {
    await this.client.connect();
    const docs = await OrderModel.find({
      ISIN: actionId.getValue(),
      status: "pending",
      executionType: "limit",
    })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(this.mapDocToOrder);
  }
  async findByIdWithAccount(
    id: OrderEntity["id"]
  ): Promise<OrderEntityWithAccount | null> {
    await this.client.connect();

    const orderDoc = await OrderModel.findById(id).lean();
    if (!orderDoc) return null;
    const accountDoc = await AccountModel.findById(orderDoc.IBAN).lean();
    const account = AccountMapper.mapDocToAccount(accountDoc);
    const order = this.mapDocToOrder(orderDoc);
    return Object.assign(order, { account });
  }
}
