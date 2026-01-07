import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { MongoClient } from "../../MongoClient";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { ActionModel } from "../models/ActionModel";
import { Money } from "@domain/values/Money";
import { ISIN } from "@domain/values/ISIN";

export class ActionRepositoryMongo implements ActionRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToAction(doc: any): ActionEntity {
    const price = Money.from({
      amount: doc.price.amount,
      currency: doc.price.currency,
    });

    return ActionEntity.from({
      ISIN: ISIN.from(doc.ISIN),
      name: doc.name,
      symbol: doc.symbol,
      market: doc.market,
      activitySector: doc.activitySector,
      price,
      isAvailable: doc.isAvailable,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      defaultQuantity: doc.defaultQuantity ?? 0,
    });
  }

  async save(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.create({
      ISIN: action.ISIN.getValue(),
      name: action.name,
      symbol: action.symbol,
      market: action.market,
      activitySector: action.activitySector,
      price: {
        amount: action.price.amount,
        currency: action.price.currency,
      },
      isAvailable: action.isAvailable,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
      defaultQuantity: action.defaultQuantity,
    });
  }

  async findByISIN(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
    await this.client.connect();

    const doc = await ActionModel.findOne({ ISIN: ISIN.getValue() }).lean();
    if (!doc) return null;

    return this.mapDocToAction(doc);
  }

  async findAll(): Promise<ActionEntity[]> {
    await this.client.connect();

    const docs = await ActionModel.find().sort({ name: 1 }).lean();
    return docs.map(this.mapDocToAction.bind(this));
  }

  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    await this.client.connect();

    const docs = await ActionModel.find({ isAvailable })
      .sort({ name: 1 })
      .lean();

    return docs.map(this.mapDocToAction.bind(this));
  }

  async setAvailability(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.updateOne(
      { ISIN: action.ISIN.getValue() },
      {
        $set: {
          isAvailable: action.isAvailable,
          updatedAt: action.updatedAt ?? new Date(),
        },
      }
    );
  }

  async update(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.updateOne(
      { ISIN: action.ISIN.getValue() },
      {
        $set: {
          name: action.name,
          symbol: action.symbol,
          market: action.market,
          activitySector: action.activitySector,
          price: {
            amount: action.price.amount,
            currency: action.price.currency,
          },
          isAvailable: action.isAvailable,
          updatedAt: action.updatedAt ?? new Date(),
          defaultQuantity: action.defaultQuantity,
        },
      }
    );
  }

  async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
    await this.client.connect();
    await ActionModel.deleteOne({ ISIN: ISIN.getValue() });
  }
}
