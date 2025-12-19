import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { MongoClient } from "../../MongoClient";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { SavingsRateModel } from "../models/SavingsRateModel";
import { Percentage } from "@domain/values/Percentage";

export class SavingsRateRepositoryMongo implements SavingRateRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToSavingsRate(doc: any): SavingsRateEntity {
    return SavingsRateEntity.from({
      id: doc._id.toString(),
      rate: Percentage.from({ value: doc.rate }),
      effectiveDate: doc.effectiveDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Taux d'épargne actuel */
  async findCurrent(): Promise<SavingsRateEntity | null> {
    await this.client.connect();

    const doc = await SavingsRateModel.findOne()
      .sort({ effectiveDate: -1 })
      .lean();

    if (!doc) return null;

    return this.mapDocToSavingsRate(doc);
  }

  /** Tous les taux d'épargne */
  async findAll(): Promise<SavingsRateEntity[]> {
    await this.client.connect();

    const docs = await SavingsRateModel.find()
      .sort({ effectiveDate: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToSavingsRate(doc));
  }

  /** Trouver un taux par ID */
  async findById(
    id: SavingsRateEntity["id"]
  ): Promise<SavingsRateEntity | null> {
    await this.client.connect();

    const doc = await SavingsRateModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToSavingsRate(doc);
  }

  /** Sauvegarder un taux d'épargne */
  async save(savingsRate: SavingsRateEntity): Promise<void> {
    await this.client.connect();

    await SavingsRateModel.create({
      _id: savingsRate.id,
      rate: savingsRate.rate.value,
      effectiveDate: savingsRate.effectiveDate,
      createdAt: savingsRate.createdAt,
      updatedAt: savingsRate.updatedAt,
    });
  }

  /** Mettre à jour un taux d'épargne */
  async update(savingsRate: SavingsRateEntity): Promise<void> {
    await this.client.connect();

    await SavingsRateModel.updateOne(
      { _id: savingsRate.id },
      {
        $set: {
          rate: savingsRate.rate.value,
          effectiveDate: savingsRate.effectiveDate,
          updatedAt: savingsRate.updatedAt,
        },
      }
    );
  }
}
