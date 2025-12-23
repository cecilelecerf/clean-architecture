import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { MongoClient } from "../../MongoClient";
import { AccountModel } from "../models/AccountModel";
import { AccountMapper } from "../../mappers/AccountMapper";

export class AccountRepositoryMongo implements AccountRepository {
  constructor(private readonly client: MongoClient) {}

  /** 🔍 Trouver tous les comptes d'un user */
  async findByUserId(
    userId: UserEntity["id"] | null
  ): Promise<AccountEntity[]> {
    await this.client.connect();

    const docs = await AccountModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => AccountMapper.mapDocToAccount(doc));
  }

  /** 🔍 Trouver un compte par IBAN */
  async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
    await this.client.connect();

    const doc = await AccountModel.findOne({ iban: iban.value }).lean();
    if (!doc) return null;

    return AccountMapper.mapDocToAccount(doc);
  }

  /** 🔍 Tous les comptes épargne */
  async findAllSavingsAccounts(): Promise<AccountEntity[]> {
    await this.client.connect();

    const docs = await AccountModel.find({ type: "epargne" })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => AccountMapper.mapDocToAccount(doc));
  }

  /** 🔍 Compte d'intérêts de la banque */
  async findBankInterestAccount(): Promise<AccountEntity | null> {
    await this.client.connect();

    const doc = await AccountModel.findOne({
      type: "epargne",
      "owner.role": "bank", // ✅ Query sur owner.role au lieu de owner_type
    }).lean();

    if (!doc) return null;

    return AccountMapper.mapDocToAccount(doc);
  }

  /** 📬 Sauvegarder un compte */
  async save(account: AccountEntity): Promise<void> {
    await this.client.connect();
    await AccountModel.create({
      iban: account.iban.value,
      userId: account.userId,
      name: account.name,
      type: account.type,
      color: account.color.getValue(),
      balance: {
        amount: account.balance.amount,
        currency: account.balance.currency,
      },
      currency: account.currency,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  }

  /** 🔄 Mettre à jour un compte */
  async update(account: AccountEntity): Promise<void> {
    await this.client.connect();

    await AccountModel.updateOne(
      { iban: account.iban.value },
      {
        $set: {
          userId: account.userId,
          name: account.name,
          type: account.type,
          color: account.color.getValue(),
          balance: {
            amount: account.balance.amount,
            currency: account.balance.currency,
          },
          currency: account.currency,
          updatedAt: account.updatedAt,
        },
      }
    );
  }

  /** ❌ Supprimer un compte */
  async delete(iban: IBAN): Promise<void> {
    await this.client.connect();

    await AccountModel.deleteOne({ iban: iban.value });
  }
}
