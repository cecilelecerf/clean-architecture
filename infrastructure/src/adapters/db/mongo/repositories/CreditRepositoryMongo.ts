import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { CreditModel } from "../models/CreditModel";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";
import { MongoClient } from "../../MongoClient";
import { UserEntity } from "@domain/entities/UserEntity";

export class CreditRepositoryMongo implements CreditRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToCredit(doc: any): CreditEntity {
    const initialAmount = Money.from(doc.initialAmount);
    const monthlyPayment = Money.from(doc.monthlyPayment);
    const remainingBalance = Money.from(doc.remainingBalance);
    const interestRate = Percentage.from(doc.interestRate);
    const insuranceRate = Percentage.from(doc.insuranceRate);

    return CreditEntity.from({
      id: doc._id.toString(),
      userId: doc.userId,
      initialAmount,
      interestRate,
      insuranceRate,
      durationMonths: doc.durationMonths,
      startDate: doc.startDate,
      monthlyPayment,
      remainingBalance,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Trouver un crédit par ID */
  async findById(id: CreditEntity["id"]): Promise<CreditEntity | null> {
    await this.client.connect();

    const doc = await CreditModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToCredit(doc);
  }

  /** Tous les crédits d'un utilisateur */
  async findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]> {
    await this.client.connect();

    const docs = await CreditModel.find({ userId })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToCredit(doc));
  }

  /** Crédits actifs */
  async findActiveCredits(): Promise<CreditEntity[]> {
    await this.client.connect();

    const docs = await CreditModel.find({
      "remainingBalance.amount": { $gt: 0 },
    })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToCredit(doc));
  }

  /** Sauvegarder un crédit */
  async save(credit: CreditEntity): Promise<void> {
    await this.client.connect();

    await CreditModel.create({
      _id: credit.id,
      userId: credit.userId,
      initialAmount: {
        amount: credit.initialAmount.amount,
        currency: credit.initialAmount.currency,
      },
      interestRate: credit.interestRate.value,
      insuranceRate: credit.insuranceRate.value,
      durationMonths: credit.durationMonths,
      startDate: credit.startDate,
      monthlyPayment: {
        amount: credit.monthlyPayment.amount,
        currency: credit.monthlyPayment.currency,
      },
      remainingBalance: {
        amount: credit.remainingBalance.amount,
        currency: credit.remainingBalance.currency,
      },
      createdAt: credit.createdAt,
      updatedAt: credit.updatedAt,
    });
  }

  /** Mettre à jour un crédit */
  async update(credit: CreditEntity): Promise<void> {
    await this.client.connect();

    await CreditModel.updateOne(
      { _id: credit.id },
      {
        $set: {
          userId: credit.userId,
          initialAmount: {
            amount: credit.initialAmount.amount,
            currency: credit.initialAmount.currency,
          },
          interestRate: credit.interestRate.value,
          insuranceRate: credit.insuranceRate.value,
          durationMonths: credit.durationMonths,
          startDate: credit.startDate,
          monthlyPayment: {
            amount: credit.monthlyPayment.amount,
            currency: credit.monthlyPayment.currency,
          },
          remainingBalance: {
            amount: credit.remainingBalance.amount,
            currency: credit.remainingBalance.currency,
          },
          updatedAt: credit.updatedAt,
        },
      }
    );
  }

  /** Supprimer un crédit */
  async delete(id: CreditEntity["id"]): Promise<void> {
    await this.client.connect();

    await CreditModel.deleteOne({ _id: id });
  }
}
