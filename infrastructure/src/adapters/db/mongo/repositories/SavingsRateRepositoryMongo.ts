import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { MongoClient } from "../../MongoClient";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { Percentage } from "@domain/values/Percentage";
import { SavingsRateModel } from "../models/SavingsRateModel";

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

  /** Taux d'épargne à une date donnée */
  async findRateAtDate(date: Date): Promise<SavingsRateEntity | null> {
    await this.client.connect();

    const doc = await SavingsRateModel.findOne({
      effectiveDate: { $lte: date },
    })
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
}
