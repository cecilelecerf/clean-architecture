import {
  TransactionEntityWithAccount,
  TransactionEntityWithAccountWithUser,
  TransactionRepository,
} from "@application/ports/repositories/TransactionRepository";
import { MongoClient } from "../../MongoClient";
import { IBAN } from "@domain/values/IBAN";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionModel } from "../models/TransactionModel";
import { Money } from "@domain/values/Money";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";
import { TransactionFilters } from "@application/usecases/transactions/GetAllTransactionsByAccountUseCase";

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
    });
  }

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

  async findByIban(iban: IBAN): Promise<TransactionEntity[]> {
    await this.client.connect();

    const docs = await TransactionModel.find({
      $or: [{ fromAccountId: iban.value }, { toAccountId: iban.value }],
    })
      .sort({ date: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToTransaction(doc));
  }

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
    });
  }

  async delete(transactionId: TransactionEntity["id"]): Promise<void> {
    await this.client.connect();

    await TransactionModel.deleteOne({ _id: transactionId });
  }

  async findById(
    id: TransactionEntity["id"]
  ): Promise<TransactionEntity | null> {
    await this.client.connect();

    const doc = await TransactionModel.findById(id).lean();

    if (!doc) return null;

    return this.mapDocToTransaction(doc);
  }

  async findByIdWithAccount(
    id: TransactionEntity["id"]
  ): Promise<TransactionEntityWithAccount | null> {
    await this.client.connect();

    const doc = await TransactionModel.findById(id)
      .populate("fromAccountId")
      .populate("toAccountId")
      .lean();

    if (!doc) return null;

    if (!doc.fromAccountId || !doc.toAccountId) return null;

    const transaction = this.mapDocToTransaction(doc);
    const fromAccount = AccountMapper.mapDocToAccount(doc.fromAccountId);
    const toAccount = AccountMapper.mapDocToAccount(doc.toAccountId);

    return Object.assign(transaction, { fromAccount, toAccount });
  }

  async findByIdWithAccountWithUser(
    id: TransactionEntity["id"]
  ): Promise<TransactionEntityWithAccountWithUser | null> {
    await this.client.connect();

    const doc = await TransactionModel.findById(id)
      .populate({
        path: "fromAccountId",
        populate: {
          path: "userId",
        },
      })
      .populate({
        path: "toAccountId",
        populate: {
          path: "userId",
        },
      })
      .lean();

    if (!doc) return null;

    if (!doc.fromAccountId || !doc.toAccountId) return null;

    const transaction = this.mapDocToTransaction(doc);
    const fromAccount = AccountMapper.mapDocToAccount(doc.fromAccountId);
    const toAccount = AccountMapper.mapDocToAccount(doc.toAccountId);
    const fromUser = UserMapper.mapDocToUser(doc.fromAccountId.userId);
    const toUser = UserMapper.mapDocToUser(doc.toAccountId.userId);

    return Object.assign(transaction, {
      fromAccount: Object.assign(fromAccount, { user: fromUser }),
      toAccount: Object.assign(toAccount, { user: toUser }),
    });
  }

  async findAllByAccountWithFilters(
    iban: IBAN,
    filters?: TransactionFilters
  ): Promise<{ transactions: TransactionEntity[]; total: number }> {
    await this.client.connect();

    const query: any = {};

    if (filters?.type) {
      if (filters.type === "debit") {
        query.fromAccountId = iban.value;
      } else if (filters.type === "credit") {
        query.toAccountId = iban.value;
      }
    } else {
      query.$or = [{ fromAccountId: iban.value }, { toAccountId: iban.value }];
    }

    if (filters?.label) {
      query.label = { $regex: filters.label, $options: "i" };
    }

    if (filters?.fromDate || filters?.toDate) {
      query.date = {};
      if (filters.fromDate) {
        query.date.$gte = filters.fromDate;
      }
      if (filters.toDate) {
        query.date.$lte = filters.toDate;
      }
    }

    const total = await TransactionModel.countDocuments(query);

    const page = Math.max(1, parseInt(String(filters?.page ?? 1), 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(String(filters?.limit ?? 20), 10))
    );
    const skip = (page - 1) * limit;

    const docs = await TransactionModel.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const transactions = docs.map((doc) => this.mapDocToTransaction(doc));

    return { transactions, total };
  }
}
