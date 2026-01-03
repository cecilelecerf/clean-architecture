import {
  CreditEntityWithFormule,
  CreditEntityWithFormuleAndAccount,
  CreditEntityWithFormuleAndAdvisor,
  CreditRepository,
} from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { CreditModel } from "../models/CreditModel";
import { Money } from "@domain/values/Money";
import { MongoClient } from "../../MongoClient";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { CreditMapper } from "../../mappers/CreditMapper";
import { AccountEntityWithUser } from "@application/ports/repositories/AccountRepository";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";
import { FormuleMapper } from "../../mappers/FormuleMapper";
import { IBAN } from "@domain/values/IBAN";
import { TransactionModel } from "../models/TransactionModel";
import { TransactionMapper } from "../../mappers/TransactionMapper";
import { TransactionEntity } from "@domain/entities/TransactionEntity";

export class CreditRepositoryMongo implements CreditRepository {
  constructor(private readonly client: MongoClient) {}

  /** Trouver un crédit par ID */
  async findById(
    id: CreditEntity["id"]
  ): Promise<CreditEntityWithFormuleAndAdvisor | null> {
    await this.client.connect();

    const doc = await CreditModel.findById(id)
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .populate({
        path: "advisor",
        model: "User",
      })
      .populate({
        path: "accountId",
        model: "Account",
      })
      .lean();
    if (!doc) return null;

    const credit = CreditMapper.mapDocToCredit(doc);
    const formule = doc.formuleId
      ? FormuleMapper.mapDocToFormule(doc.formuleId)
      : null;
    const advisor = doc.accountId.userId
      ? UserMapper.mapDocToUser(doc.accountId.userId)
      : null;
    const account = doc.accountId
      ? AccountMapper.mapDocToAccount(doc.accountId)
      : null;

    let transactions: TransactionEntity[] = [];

    if (doc.accountId && doc.formuleId?.accountId) {
      const transactionDocs = await TransactionModel.find({
        fromAccountId: doc.accountId._id,
        toAccountId: doc.formuleId.accountId,
      }).lean();

      transactions = transactionDocs.map((t) =>
        TransactionMapper.mapDocToTransaction(t)
      );
    }

    return Object.assign(credit, {
      formule,
      advisor,
      account,
      transactions,
    }) as CreditEntityWithFormuleAndAdvisor;
  }

  /** Trouver un crédit par ID avec les détails du comptes, de l'utilisateur du compte ainsi que de la formule du crédit*/
  async findByIdWithDetails(
    id: CreditEntity["id"]
  ): Promise<CreditEntityWithFormuleAndAccount | null> {
    await this.client.connect();

    const doc = await CreditModel.findById(id)
      .populate({
        path: "accountId",
        model: "Account",
        localField: "accountId",
        foreignField: "iban",
        populate: {
          path: "userId",
          model: "User",
        },
      })
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .lean();

    if (!doc) return null;

    const credit = CreditMapper.mapDocToCredit(doc);

    let account: AccountEntityWithUser | null = null;
    if (doc.accountId) {
      const baseAccount = AccountMapper.mapDocToAccount(doc.accountId);
      const user = UserMapper.mapDocToUser(doc.accountId.userId);
      (baseAccount as AccountEntityWithUser).user = user;
      account = baseAccount as AccountEntityWithUser;
    }

    const formule = doc.formuleId
      ? FormuleMapper.mapDocToFormule(doc.formuleId)
      : null;

    return Object.assign(credit, {
      account,
      formule,
    }) as CreditEntityWithFormuleAndAccount;
  }

  /** Tous les crédits d'un compte */
  async findAllByAccountIban(
    accountId: IBAN
  ): Promise<CreditEntityWithFormule[]> {
    await this.client.connect();

    const docs = await CreditModel.find({
      accountId: accountId.value.toString(),
    })
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => {
      const credit = CreditMapper.mapDocToCredit(doc);
      const formule = doc.formuleId
        ? FormuleMapper.mapDocToFormule(doc.formuleId)
        : null;
      return Object.assign(credit, { formule });
    });
  }

  /** Crédits actifs */
  async findActiveCredits(today: Date): Promise<CreditEntityWithFormule[]> {
    await this.client.connect();

    // Au cas où erreur de date
    // const startOfToday = new Date(today);
    // startOfToday.setHours(0, 0, 0, 0);

    const docs = await CreditModel.find({
      status: "ACCEPTED",
      "remainingBalance.amount": { $gt: 0 },
      startDate: { $gte: today },
    })
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => {
      const credit = CreditMapper.mapDocToCredit(doc);
      const formule = doc.formuleId
        ? FormuleMapper.mapDocToFormule(doc.formuleId)
        : null;
      return Object.assign(credit, { formule });
    });
  }

  /** Crédits en attente */
  async findPendingCredits(): Promise<CreditEntityWithFormule[]> {
    await this.client.connect();

    const docs = await CreditModel.find({
      status: { $gt: "PENDING" },
    })
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => {
      const credit = CreditMapper.mapDocToCredit(doc);
      const formule = doc.formuleId
        ? FormuleMapper.mapDocToFormule(doc.formuleId)
        : null;
      return Object.assign(credit, { formule });
    });
  }

  /** Sauvegarder un crédit */
  async save(credit: CreditEntity): Promise<void> {
    await this.client.connect();

    await CreditModel.create({
      _id: credit.id,
      accountId: credit.accountId,
      formuleCreditId: credit.formuleCreditId,
      initialAmount: {
        amount: credit.initialAmount.amount,
        currency: credit.initialAmount.currency,
      },
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
      reason: credit.reason,
    });
  }

  /** Mettre à jour un crédit */
  async update(credit: CreditEntity): Promise<void> {
    await this.client.connect();

    await CreditModel.updateOne(
      { _id: credit.id },
      {
        $set: {
          accountId: credit.accountId,
          formuleCreditId: credit.formuleCreditId,
          initialAmount: {
            amount: credit.initialAmount.amount,
            currency: credit.initialAmount.currency,
          },
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
          reason: credit.reason,
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
