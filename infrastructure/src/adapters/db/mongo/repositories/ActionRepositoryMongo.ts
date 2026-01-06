import {
  ActionRepository,
  ActionStatistics,
} from "@application/ports/repositories/ActionRepository";
import { MongoClient } from "../../MongoClient";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { ActionModel } from "../models/ActionModel";
import { Money } from "@domain/values/Money";
import { ActionPriceHistoryModel } from "../models/ActionPriceHistoryModel";

export class ActionRepositoryMongo implements ActionRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToAction(doc: any): ActionEntity {
    const currentPrice = Money.from(doc.currentPrice);

    return ActionEntity.from({
      ISIN: doc.ISIN,
      name: doc.name,
      totalNb: doc.totalNb,
      symbol: doc.symbol,
      market: doc.market,
      activitySector: doc.activitySector,
      currentPrice,
      isAvailable: doc.isAvailable,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Sauvegarder une action */
  async save(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.create({
      ISIN: action.ISIN,
      name: action.name,
      totalNb: action.totalNb,
      symbol: action.symbol,
      market: action.market,
      activitySector: action.activitySector,
      currentPrice: {
        amount: action.currentPrice.amount,
        currency: action.currentPrice.currency,
      },
      isAvailable: action.isAvailable,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    });
  }

  /** Trouver une action par ISIN */
  async findByISIN(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
    await this.client.connect();

    const doc = await ActionModel.findOne({ ISIN }).lean();
    if (!doc) return null;

    return this.mapDocToAction(doc);
  }

  /** Toutes les actions */
  async findAll(): Promise<ActionEntity[]> {
    await this.client.connect();

    const docs = await ActionModel.find().sort({ name: 1 }).lean();

    return docs.map((doc) => this.mapDocToAction(doc));
  }

  /** Actions par disponibilité */
  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    await this.client.connect();

    const docs = await ActionModel.find({ isAvailable })
      .sort({ name: 1 })
      .lean();

    return docs.map((doc) => this.mapDocToAction(doc));
  }

  /** Modifier la disponibilité */
  async setAvailability(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.updateOne(
      { ISIN: action.ISIN },
      { $set: { isAvailable: action.isAvailable } }
    );
  }

  /** Mettre à jour une action */
  async update(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.updateOne(
      { ISIN: action.ISIN },
      {
        $set: {
          name: action.name,
          totalNb: action.totalNb,
          symbol: action.symbol,
          market: action.market,
          activitySector: action.activitySector,
          currentPrice: {
            amount: action.currentPrice.amount,
            currency: action.currentPrice.currency,
          },
          isAvailable: action.isAvailable,
          updatedAt: action.updatedAt,
        },
      }
    );
  }

  /** Supprimer une action */
  async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
    await this.client.connect();

    await ActionModel.deleteOne({ ISIN });
  }

  async getStatistics(isin: string): Promise<ActionStatistics> {
    await this.client.connect();

    const action = await ActionModel.findOne({ ISIN: isin }).lean();
    const price = action?.currentPrice.amount || 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const history = await ActionPriceHistoryModel.find({
      isin,
      date: { $gte: cutoffDate },
    })
      .sort({ date: 1 })
      .lean();

    const date24h = new Date();
    date24h.setDate(date24h.getDate() - 1);

    const date7d = new Date();
    date7d.setDate(date7d.getDate() - 7);

    const price24h =
      history.find((h) => new Date(h.date) >= date24h)?.price || price;
    const price7d =
      history.find((h) => new Date(h.date) >= date7d)?.price || price;
    const price30d = history[0]?.price || price;

    const change24h = price24h > 0 ? ((price - price24h) / price24h) * 100 : 0;
    const change7d = price7d > 0 ? ((price - price7d) / price7d) * 100 : 0;
    const change30d = price30d > 0 ? ((price - price30d) / price30d) * 100 : 0;

    const prices = history.map((h) => h.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : price;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : price;
    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : price;
    const totalVolume = history.reduce((sum, h) => sum + h.volume, 0);

    return {
      priceChange: Math.round(change24h * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      change7d: Math.round(change7d * 100) / 100,
      change30d: Math.round(change30d * 100) / 100,
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      totalVolume,
      transactionCount: history.length,
    };
  }
}
