import {
  ActionRepository,
  ActionStatistics,
} from "@application/ports/repositories/ActionRepository";
import { MongoClient } from "../../MongoClient";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { ActionModel } from "../models/ActionModel";
import { Money } from "@domain/values/Money";
import { ActionPriceHistoryModel } from "../models/ActionPriceHistoryModel";
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

  /** Sauvegarder une action */
  async save(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.create({
      ISIN: action.ISIN.getValue(),
      name: action.name,
      symbol: action.symbol,
      market: action.market,
      activitySector: action.activitySector,
      price: { amount: action.price.amount, currency: action.price.currency },
      isAvailable: action.isAvailable,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
      defaultQuantity: action.defaultQuantity,
    });
  }

  /** Trouver une action par ISIN */
  async findByISIN(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
    await this.client.connect();

    const doc = await ActionModel.findOne({ ISIN: ISIN.getValue() }).lean();
    if (!doc) return null;

    return this.mapDocToAction(doc);
  }

  /** Toutes les actions */
  async findAll(): Promise<ActionEntity[]> {
    await this.client.connect();

    const docs = await ActionModel.find().sort({ name: 1 }).lean();
    return docs.map(this.mapDocToAction.bind(this));
  }

  /** Actions par disponibilité */
  async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
    await this.client.connect();

    const docs = await ActionModel.find({ isAvailable })
      .sort({ name: 1 })
      .lean();
    return docs.map(this.mapDocToAction.bind(this));
  }

  /** Modifier la disponibilité */
  async setAvailability(action: ActionEntity): Promise<void> {
    await this.client.connect();

    await ActionModel.updateOne(
      { ISIN: action.ISIN.getValue() },
      { $set: { isAvailable: action.isAvailable, updatedAt: action.updatedAt } }
    );
  }

  /** Mettre à jour une action */
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
          updatedAt: action.updatedAt,
          defaultQuantity: action.defaultQuantity,
        },
      }
    );
  }

  /** Supprimer une action */
  async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
    await this.client.connect();
    await ActionModel.deleteOne({ ISIN: ISIN.getValue() });
  }

  /** Statistiques d'une action */
  async getStatistics(isin: ISIN, now: Date): Promise<ActionStatistics> {
    await this.client.connect();

    const action = await ActionModel.findOne({ ISIN: isin }).lean();
    if (!action) throw new Error("Action not found");

    const price = action.price.amount;

    const cutoff30d = now;
    cutoff30d.setDate(cutoff30d.getDate() - 30);

    const history = await ActionPriceHistoryModel.find({
      isin,
      date: { $gte: cutoff30d },
    })
      .sort({ date: 1 })
      .lean();

    const cutoff24h = now;
    cutoff24h.setDate(cutoff24h.getDate() - 1);
    const cutoff7d = now;
    cutoff7d.setDate(cutoff7d.getDate() - 7);

    const price24h = history.find((h) => h.date >= cutoff24h)?.price ?? price;
    const price7d = history.find((h) => h.date >= cutoff7d)?.price ?? price;
    const price30d = history[0]?.price ?? price;

    const change24h = price24h > 0 ? ((price - price24h) / price24h) * 100 : 0;
    const change7d = price7d > 0 ? ((price - price7d) / price7d) * 100 : 0;
    const change30d = price30d > 0 ? ((price - price30d) / price30d) * 100 : 0;

    const prices = history.map((h) => h.price);
    const minPrice = prices.length ? Math.min(...prices) : price;
    const maxPrice = prices.length ? Math.max(...prices) : price;
    const averagePrice = prices.length
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
