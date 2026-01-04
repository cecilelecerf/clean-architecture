import { ActionPriceHistoryRepository } from "@application/ports/repositories/ActionPriceHistoryRepository";
import { ActionPriceHistoryEntity } from "@domain/entities/ActionPriceHistoryEntity";
import { MongoClient } from "../../MongoClient";
import { ActionPriceHistoryModel } from "../models/ActionPriceHistoryModel";

export class ActionPriceHistoryRepositoryMongo
  implements ActionPriceHistoryRepository
{
  constructor(private readonly client: MongoClient) {}

  async save(history: ActionPriceHistoryEntity): Promise<void> {
    await this.client.connect();

    await ActionPriceHistoryModel.create({
      _id: history.id,
      isin: history.isin,
      date: history.date,
      price: history.price,
      volume: history.volume,
      createdAt: history.createdAt,
    });
  }

  async findByISIN(
    isin: string,
    now: Date,
    days: number = 30
  ): Promise<ActionPriceHistoryEntity[]> {
    await this.client.connect();

    const cutoffDate = now;
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const docs = await ActionPriceHistoryModel.find({
      isin,
      date: { $gte: cutoffDate },
    })
      .sort({ date: 1 })
      .lean();

    return docs.map((doc) =>
      ActionPriceHistoryEntity.from({
        id: doc._id.toString(),
        isin: doc.isin,
        date: new Date(doc.date),
        price: doc.price,
        volume: doc.volume,
        createdAt: new Date(doc.createdAt || doc.date),
      })
    );
  }

  async findByISINAndDateRange(
    isin: string,
    startDate: Date,
    endDate: Date
  ): Promise<ActionPriceHistoryEntity[]> {
    await this.client.connect();

    const docs = await ActionPriceHistoryModel.find({
      isin,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();

    return docs.map((doc) =>
      ActionPriceHistoryEntity.from({
        id: doc._id.toString(),
        isin: doc.isin,
        date: new Date(doc.date),
        price: doc.price,
        volume: doc.volume,
        createdAt: new Date(doc.createdAt || doc.date),
      })
    );
  }

  async deleteByISIN(isin: string): Promise<void> {
    await this.client.connect();

    await ActionPriceHistoryModel.deleteMany({ isin });
  }
}
