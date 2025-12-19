import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { MongoClient } from "../../MongoClient";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { ActionModel } from "../models/ActionModel";
import { Money } from "@domain/values/Money";

export class ActionRepositoryMongo implements ActionRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToAction(doc: any): ActionEntity {
    const currentPrice = Money.create(doc.currentPrice);
    if (currentPrice instanceof Error) throw currentPrice;

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
}
