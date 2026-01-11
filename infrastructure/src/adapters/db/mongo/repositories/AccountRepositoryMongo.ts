import {
  AccountEntityWithUser,
  AccountRepository,
} from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { MongoClient } from "../../MongoClient";
import { AccountModel } from "../models/AccountModel";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";

export class AccountRepositoryMongo implements AccountRepository {
  constructor(private readonly client: MongoClient) {}

  /** Tous les comptes d'un utilisateur */
  async findByUserId(
    userId: UserEntity["id"] | null
  ): Promise<AccountEntity[]> {
    await this.client.connect();
    const docs = await AccountModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(AccountMapper.mapDocToAccount);
  }

  /** Trouver un compte par IBAN */
  async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
    await this.client.connect();
    const doc = await AccountModel.findById(iban.value).lean();
    return doc ? AccountMapper.mapDocToAccount(doc) : null;
  }

  /** Tous les comptes épargne */
  async findAllSavingsAccounts(): Promise<AccountEntity[]> {
    await this.client.connect();
    const docs = await AccountModel.find({
      type: "epargne",
      userId: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => AccountMapper.mapDocToAccount(doc));
  }

  /** Compte d'intérêts de la banque */
  async findBankInterestAccount(): Promise<AccountEntity | null> {
    await this.client.connect();
    const doc = await AccountModel.findOne({
      type: "epargne",
      userId: null,
    }).lean();
    const account = AccountMapper.mapDocToAccount(doc);
    return doc ? AccountMapper.mapDocToAccount(doc) : null;
  }

  /** Trouver une liste de comptes par section avec l'utilisateur */
  async findByTypeSectionWithUser(
    type: "client" | "bank"
  ): Promise<AccountEntityWithUser[]> {
    await this.client.connect();
    const condition =
      type === "client" ? { userId: { $ne: null } } : { userId: null };
    const docs = await AccountModel.find(condition)
      .populate({ path: "userId", model: "User" })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => {
      const account = AccountMapper.mapDocToAccount(doc);
      const user =
        doc.userId && typeof doc.userId === "object"
          ? UserMapper.mapDocToUser(doc.userId)
          : null;
      return Object.assign(account, { user }) as AccountEntityWithUser;
    });
  }

  /** Sauvegarder un compte */
  async save(account: AccountEntity): Promise<void> {
    await this.client.connect();
    await AccountModel.create({
      _id: account.iban.value,
      userId: account.userId,
      name: account.name,
      type: account.type,
      color: account.color.getValue(),
      balance: {
        amount: account.balance.amount,
        currency: account.balance.currency,
      },
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  }

  /** Mettre à jour un compte */
  async update(account: AccountEntity): Promise<void> {
    await this.client.connect();
    await AccountModel.findByIdAndUpdate(account.iban.value, {
      $set: {
        userId: account.userId,
        name: account.name,
        type: account.type,
        color: account.color.getValue(),
        balance: {
          amount: account.balance.amount,
          currency: account.balance.currency,
        },
        updatedAt: account.updatedAt,
      },
    });
  }

  /** Supprimer un compte */
  async delete(iban: IBAN): Promise<void> {
    await this.client.connect();
    await AccountModel.findByIdAndDelete(iban.value);
  }
}
