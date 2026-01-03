import {
  CreditEntityWithFormule,
  CreditEntityWithFormuleAndAccount,
  CreditEntityWithFormuleAndAdvisor,
  CreditRepository,
} from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { CreditModel } from "../models/CreditModel";
import { AccountModel } from "../models/AccountModel";
import { MongoClient } from "../../MongoClient";
import { AccountEntityWithUser } from "@application/ports/repositories/AccountRepository";
import { CreditMapper } from "../../mappers/CreditMapper";
import { AccountMapper } from "../../mappers/AccountMapper";
import { UserMapper } from "../../mappers/UserMapper";
import { FormuleMapper } from "../../mappers/FormuleMapper";
import { IBAN } from "@domain/values/IBAN";
import { TransactionModel } from "../models/TransactionModel";
import { TransactionMapper } from "../../mappers/TransactionMapper";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { FormuleCreditModel } from "../models/FormuleCreditModel";

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
        path: "advisorId",
        model: "User",
      })
      .populate({
        path: "accountId",
        model: "Account",
      })
      .lean();

    if (!doc) return null;

    const credit = CreditMapper.mapDocToCredit(doc);
    const formule = doc.formuleCreditId
      ? FormuleMapper.mapDocToFormule(doc.formuleCreditId)
      : null;
    const advisor = doc.advisorId
      ? UserMapper.mapDocToUser(doc.advisorId)
      : null;
    const account = doc.accountId
      ? AccountMapper.mapDocToAccount(doc.accountId)
      : null;

    let transactions: TransactionEntity[] = [];

    if (doc.accountId && doc.formuleCreditId?.accountId) {
      const transactionDocs = await TransactionModel.find({
        fromAccountId: doc.accountId._id,
        toAccountId: doc.formuleCreditId.accountId,
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

    const formule = doc.formuleCreditId
      ? FormuleMapper.mapDocToFormule(doc.formuleCreditId)
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
      const formule = FormuleMapper.mapDocToFormule(doc.formuleCreditId);
      return Object.assign(credit, { formule });
    });
  }

  /** Crédits par status */
  async findAllByStatus(
    status?: CreditEntity["status"]
  ): Promise<CreditEntityWithFormule[]> {
    await this.client.connect();

    const query = status ? { status } : {};

    const docs = await CreditModel.find(query)
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => {
      const credit = CreditMapper.mapDocToCredit(doc);
      const formule = FormuleMapper.mapDocToFormule(doc.formuleCreditId);
      return Object.assign(credit, { formule });
    });
  }

  /** Tous les crédits d'un utilisateur */
  async findAllByUserId(
    userId: UserEntity["id"]
  ): Promise<CreditEntityWithFormule[]> {
    await this.client.connect();

    // Trouver d'abord tous les comptes de l'utilisateur
    const accounts = await AccountModel.find({ userId }).lean();
    const accountIbans = accounts.map((acc) => acc.iban);

    // Trouver tous les crédits liés à ces comptes
    const docs = await CreditModel.find({
      accountId: { $in: accountIbans },
    })
      .populate({
        path: "formuleCreditId",
        model: "Formule",
      })
      .sort({ startDate: -1 })
      .lean();

    return docs.map((doc) => {
      const credit = CreditMapper.mapDocToCredit(doc);
      const formule = FormuleMapper.mapDocToFormule(doc.formuleCreditId);
      return Object.assign(credit, { formule });
    });
  }

  /** Tous les crédits d'une formule */
  async findAllByFormuleId(
    formuleId: FormuleCreditEntity["id"]
  ): Promise<CreditEntity[]> {
    await this.client.connect();

    const docs = await CreditModel.find({
      formuleCreditId: formuleId,
    })
      .sort({ updatedAt: 1 })
      .lean();

    return docs.map((doc) => CreditMapper.mapDocToCredit(doc));
  }

  /** Sauvegarder un crédit */
  async save(credit: CreditEntity): Promise<void> {
    await this.client.connect();

    await CreditModel.create({
      _id: credit.id,
      accountId: credit.accountId.value,
      formuleCreditId: credit.formuleCreditId,
      advisorId: credit.advisorId,
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
      status: credit.status,
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
          accountId: credit.accountId.value,
          formuleCreditId: credit.formuleCreditId,
          advisorId: credit.advisorId,
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
          status: credit.status,
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

  // ============================================================================
  // Méthodes de statistiques
  // ============================================================================

  /** Compter les crédits acceptés par conseiller */
  async countAcceptedByAdvisor(advisorId: string): Promise<number> {
    await this.client.connect();

    return await CreditModel.countDocuments({
      advisorId,
      status: { $in: ["ACCEPTED", "COMPLETED"] },
    });
  }

  /** Compter les crédits refusés par conseiller */
  async countRefusedByAdvisor(advisorId: string): Promise<number> {
    await this.client.connect();

    return await CreditModel.countDocuments({
      advisorId,
      status: "REFUSED",
    });
  }

  /** Compter tous les crédits d'une formule */
  async countByFormule(formuleId: string): Promise<number> {
    await this.client.connect();

    return await CreditModel.countDocuments({
      formuleCreditId: formuleId,
    });
  }

  /** Compter les crédits d'une formule par statut */
  async countByFormuleAndStatus(
    formuleId: string,
    status: CreditEntity["status"]
  ): Promise<number> {
    await this.client.connect();

    return await CreditModel.countDocuments({
      formuleCreditId: formuleId,
      status,
    });
  }

  /** Compter les clients uniques d'une formule */
  async countClientsByFormule(formuleId: string): Promise<number> {
    await this.client.connect();

    const result = await CreditModel.distinct("accountId", {
      formuleCreditId: formuleId,
    });

    return result.length;
  }

  /** Obtenir les statistiques financières d'une formule */
  async getFinancialStatsByFormule(formuleId: string): Promise<{
    totalLoanedAmount: number;
    totalInterestEarned: number;
    totalInsuranceEarned: number;
    totalRevenue: number;
  }> {
    await this.client.connect();

    // Récupérer la formule pour avoir les taux
    const formule = await FormuleCreditModel.findById(formuleId).lean();
    if (!formule) {
      return {
        totalLoanedAmount: 0,
        totalInterestEarned: 0,
        totalInsuranceEarned: 0,
        totalRevenue: 0,
      };
    }

    // Récupérer tous les crédits de cette formule qui sont acceptés ou terminés
    const credits = await CreditModel.find({
      formuleCreditId: formuleId,
      status: { $in: ["COMPLETED", "ACCEPTED"] },
    }).lean();

    let totalLoanedAmount = 0;
    let totalInterestEarned = 0;
    let totalInsuranceEarned = 0;

    credits.forEach((credit) => {
      const amount = credit.initialAmount.amount;
      const durationMonths = credit.durationMonths;

      // Montant total prêté
      totalLoanedAmount += amount;

      // Calcul des intérêts
      const monthlyInterestRate = formule.interestRate / 100 / 12;
      const totalInterest = amount * monthlyInterestRate * durationMonths;
      totalInterestEarned += totalInterest;

      // Calcul de l'assurance
      const monthlyInsuranceRate = formule.insuranceRate / 100 / 12;
      const totalInsurance = amount * monthlyInsuranceRate * durationMonths;
      totalInsuranceEarned += totalInsurance;
    });

    const totalRevenue = totalInterestEarned + totalInsuranceEarned;

    return {
      totalLoanedAmount: Math.round(totalLoanedAmount * 100) / 100,
      totalInterestEarned: Math.round(totalInterestEarned * 100) / 100,
      totalInsuranceEarned: Math.round(totalInsuranceEarned * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }
}
