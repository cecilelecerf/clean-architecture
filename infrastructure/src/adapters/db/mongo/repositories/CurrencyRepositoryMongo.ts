import { CurrencyEntity } from "@domain/entities/CurrencyEntity";
import { MongoClient } from "../../MongoClient";
import { CurrencyModel } from "../models/CurrencyModel";
import { CurrencyRepository } from "@application/ports/repositories/CurrencyRepository";

export class CurrencyRepositoryMongo implements CurrencyRepository {
  constructor(private readonly client: MongoClient) {}

  async save(currency: CurrencyEntity): Promise<void> {
    await this.client.connect();

    await CurrencyModel.create({
      _id: currency.code,
      code: currency.code,
      exchangeRate: currency.exchangeRate,
      createdAt: currency.createdAt,
      updatedAt: currency.updatedAt || currency.createdAt,
    });
  }

  async update(currency: CurrencyEntity): Promise<void> {
    await this.client.connect();

    await CurrencyModel.findByIdAndUpdate(currency.code, {
      $set: {
        exchangeRate: currency.exchangeRate,
        updatedAt: currency.updatedAt,
      },
    });
  }

  async delete(code: string): Promise<void> {
    await this.client.connect();

    await CurrencyModel.deleteOne({ code: code.toUpperCase() });
  }

  async findByCode(code: string): Promise<CurrencyEntity | null> {
    await this.client.connect();

    const doc = await CurrencyModel.findById(code.toUpperCase()).lean();

    if (!doc) return null;

    return this.mapDocToEntity(doc);
  }

  async findAll(): Promise<CurrencyEntity[]> {
    await this.client.connect();

    const docs = await CurrencyModel.find().sort({ code: 1 }).lean();

    return docs.map((doc) => this.mapDocToEntity(doc));
  }

  private mapDocToEntity(doc: any): CurrencyEntity {
    return CurrencyEntity.from({
      code: doc._id.toString(),
      exchangeRate: doc.exchangeRate,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    });
  }
}
