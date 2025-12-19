import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { MongoClient } from "../../MongoClient";
import { IBAN } from "@domain/values/IBAN";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionModel } from "../models/TransactionModel";
import { Money } from "@domain/values/Money";

export class TransactionRepositoryMongo implements TransactionRepository {
  constructor(private readonly client: MongoClient) {}

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<TransactionEntity[]> {
    await this.client.connect();
    const docs = await TransactionModel.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();

    return docs.map((doc) =>
      TransactionEntity.from({
        id: doc._id.toString(),
        fromAccountId: doc.fromAccountId as IBAN,
        toAccountId: doc.toAccountId as IBAN,
        amount: Money.from({ amount: doc.amount, currency: doc.currency }),
        label: doc.label,
        icon: doc.icon,
        date: doc.date,
        type: doc.type,
      })
    );
  }

  async findByIban(iban: IBAN): Promise<TransactionEntity[]> {
    await this.client.connect();

    const docs = await TransactionModel.find({ iban: iban.value }).lean();

    return docs.map((doc: any) => {
      const amount = Money.create(doc.amount);
      if (amount instanceof Error) throw amount;

      return TransactionEntity.from({
        id: doc._id.toString(),
        label: doc.label,
        icon: doc.icon,
        fromAccountId: doc.fromAccountId,
        toAccountId: doc.toAccountId,
        amount,
        date: doc.date,
        type: doc.type,
      });
    });
  }

  async save(transaction: TransactionEntity): Promise<void> {
    await this.client.connect();

    await TransactionModel.create({
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
    } as any);
  }

  async delete(transactionId: TransactionEntity["id"]): Promise<void> {
    await this.client.connect();

    await TransactionModel.deleteOne({ _id: transactionId });
  }
}
