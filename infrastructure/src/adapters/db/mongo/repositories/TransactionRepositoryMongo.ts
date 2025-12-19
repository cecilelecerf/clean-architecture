import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { MongoClient } from "../../MongoClient";
import { IBAN } from "@domain/values/IBAN";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionModel } from "../models/TransactionModel";
import { Money } from "@domain/values/Money";

export class TransactionRepositoryMongo implements TransactionRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToTransaction(doc: any): TransactionEntity {
    const amount = Money.from(doc.amount);
    const fromAccountId = IBAN.from(doc.fromAccountId);
    const toAccountId = IBAN.from(doc.toAccountId);

    return TransactionEntity.from({
      id: doc._id.toString(),
      fromAccountId,
      toAccountId,
      amount,
      label: doc.label,
      icon: doc.icon,
      date: doc.date,
      type: doc.type,
    });
  }

  /** Transactions par période */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<TransactionEntity[]> {
    await this.client.connect();

    const docs = await TransactionModel.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToTransaction(doc));
  }

  /** Transactions par IBAN */
  async findByIban(iban: IBAN): Promise<TransactionEntity[]> {
    await this.client.connect();

    const docs = await TransactionModel.find({
      $or: [{ fromAccountId: iban.value }, { toAccountId: iban.value }],
    })
      .sort({ date: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToTransaction(doc));
  }

  /** Sauvegarder une transaction */
  async save(transaction: TransactionEntity): Promise<void> {
    await this.client.connect();

    await TransactionModel.create({
      _id: transaction.id,
      label: transaction.label,
      icon: transaction.icon,
      fromAccountId: transaction.fromAccountId.value,
      toAccountId: transaction.toAccountId.value,
      amount: {
        amount: transaction.amount.amount,
        currency: transaction.amount.currency,
      },
      date: transaction.date,
      type: transaction.type,
    });
  }

  /** Supprimer une transaction */
  async delete(transactionId: TransactionEntity["id"]): Promise<void> {
    await this.client.connect();

    await TransactionModel.deleteOne({ _id: transactionId });
  }
}
