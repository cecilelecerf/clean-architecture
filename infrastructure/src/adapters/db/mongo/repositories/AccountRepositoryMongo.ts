import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBAN } from "@domain/values/IBAN";
import { MongoClient } from "../../MongoClient";
import { AccountModel } from "../models/AccountModel";
import { Money } from "@domain/values/Money";
import { Color } from "@domain/values/Color";
import { AccountOwner } from "@domain/values/AccountOwner";

export class AccountRepositoryMongo implements AccountRepository {
  constructor(private readonly client: MongoClient) {}

  // 🔧 Méthode helper pour mapper un document MongoDB vers AccountEntity
  private mapDocToAccount(doc: any): AccountEntity {
    const iban = IBAN.from(doc.iban);
    const owner = AccountOwner.from(doc.owner);
    const balance = Money.from(doc.balance);
    const color = Color.from(doc.color);

    return AccountEntity.from({
      iban,
      owner,
      name: doc.name,
      type: doc.type,
      color,
      balance,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** 🔍 Trouver tous les comptes d'un user */
  async findByUserId(userId: UserEntity["id"]): Promise<AccountEntity[]> {
    await this.client.connect();

    const docs = await AccountModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToAccount(doc));
  }

  /** 🔍 Trouver un compte par IBAN */
  async findByIBAN(iban: IBAN): Promise<AccountEntity | null> {
    await this.client.connect();

    const doc = await AccountModel.findOne({ iban: iban.value }).lean();
    if (!doc) return null;

    return this.mapDocToAccount(doc);
  }

  /** 🔍 Tous les comptes épargne */
  async findAllSavingsAccounts(): Promise<AccountEntity[]> {
    await this.client.connect();

    const docs = await AccountModel.find({ type: "epargne" })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToAccount(doc));
  }

  /** 🔍 Compte d'intérêts de la banque */
  async findBankInterestAccount(): Promise<AccountEntity | null> {
    await this.client.connect();

    const doc = await AccountModel.findOne({
      type: "epargne",
      "owner.role": "bank", // ✅ Query sur owner.role au lieu de owner_type
    }).lean();

    if (!doc) return null;

    return this.mapDocToAccount(doc);
  }

  /** 📬 Sauvegarder un compte */
  async save(account: AccountEntity): Promise<void> {
    await this.client.connect();

    await AccountModel.create({
      iban: account.iban.value,
      owner: {
        role: account.owner.role,
        userId: account.owner.userId ?? null,
      },
      name: account.name,
      type: account.type,
      color: account.color.getValue(),
      balance: {
        amount: account.balance.amount,
        currency: account.balance.currency,
      },
      createdAt: account.createdAt,
    });
  }

  /** 🔄 Mettre à jour un compte */
  async update(account: AccountEntity): Promise<void> {
    await this.client.connect();

    await AccountModel.updateOne(
      { iban: account.iban.value },
      {
        $set: {
          owner: {
            role: account.owner.role,
            userId: account.owner.userId ?? null,
          },
          name: account.name,
          type: account.type,
          color: account.color.getValue(),
          balance: {
            amount: account.balance.amount,
            currency: account.balance.currency,
          },
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
