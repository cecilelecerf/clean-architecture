import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { CreditAlreadyPaidError } from "@domain/errors/credit";
import { EmailService } from "@application/ports/services/EmailService";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { TransactionEntity } from "domain/entities/TransactionEntity";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { AccountNotFoundError } from "@application/errors/accounts";
import { MoneyConverter } from "domain/services/MoneyConverter";

type CreditPaymentResult = {
  creditId: string;
  success: boolean;
  error?: Error;
  amountPaid?: number;
};

export class ApplyMonthlyCreditsPaymentUsecase {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly formuleRepository: FormuleCreditRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly accountRepository: AccountRepository,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService,
    private readonly transactionRepository: TransactionRepository,
    private readonly moneyConvertor: MoneyConverter
  ) {}

  public async execute(): Promise<{
    totalProcessed: number;
    successful: number;
    failed: number;
    results: CreditPaymentResult[];
  }> {
    const activeCredits = await this.creditRepository.findAllByStatus(
      CreditStatus["ACCEPTED"]
    );
    const bankAccount = await this.accountRepository.findBankReadyAccount();
    if (!bankAccount) {
      console.error("[CRON] ❌ Aucun compte bancaire trouvé");
      return {
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        results: [],
      };
    }
    const results: CreditPaymentResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const credit of activeCredits) {
      try {
        if (credit.isFullyPaid()) {
          results.push({
            creditId: credit.id,
            success: false,
            error: new CreditAlreadyPaidError(credit.id),
          });
          failed++;
          continue;
        }

        const formuleCredit = await this.formuleRepository.findById(
          credit.formuleCreditId
        );

        if (!formuleCredit) {
          results.push({
            creditId: credit.id,
            success: false,
            error: new FormuleCreditNotFoundError(),
          });
          failed++;
          continue;
        }
        const account = await this.accountRepository.findByIBAN(
          credit.accountId
        );
        if (!account) {
          results.push({
            creditId: credit.id,
            success: false,
            error: new AccountNotFoundError(),
          });
          failed++;
          continue;
        }

        const montant = await this.moneyConvertor.convert(
          credit.monthlyPayment,
          account.balance.currency
        );
        if (montant instanceof Error) {
          results.push({
            creditId: credit.id,
            success: false,
            error: montant,
          });
          failed++;
          continue;
        }
        const updatedAccount = account.debit(montant);
        if (updatedAccount instanceof Error) {
          results.push({
            creditId: credit.id,
            success: false,
            error: updatedAccount,
          });
          failed++;
          continue;
        }

        const transaction = TransactionEntity.create({
          id: this.uuidService.generate(),
          fromAccountId: account.iban,
          toAccountId: bankAccount.iban,
          icon: "🏦",
          amount: montant,
          date: this.clockService.now(),
          label: "Remboursement de crédit",
        });
        if (transaction instanceof Error) {
          results.push({
            creditId: credit.id,
            success: false,
            error: transaction,
          });
          failed++;
          continue;
        }
        const paymentResult = credit.payMonthly(
          formuleCredit.interestRate,
          formuleCredit.insuranceRate
        );

        if (paymentResult instanceof Error) {
          results.push({
            creditId: credit.id,
            success: false,
            error: paymentResult,
          });
          failed++;
          continue;
        }

        await this.creditRepository.update(credit);
        await this.transactionRepository.save(transaction);
        await this.accountRepository.update(account);
        await this.notifyClient(credit);

        results.push({
          creditId: credit.id,
          success: true,
          amountPaid: paymentResult.monthlyPayment.amount,
        });
        successful++;
      } catch (error) {
        results.push({
          creditId: credit.id,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
        failed++;
      }
    }

    return {
      totalProcessed: activeCredits.length,
      successful,
      failed,
      results,
    };
  }

  private async notifyClient(credit: CreditEntity): Promise<void> {
    try {
      const account = await this.accountRepository.findByIBAN(credit.accountId);
      if (!account || !account.userId) return;
      const user = await this.userRepository.findById(account.userId);
      if (!user || !user.isActive()) return;

      await this.emailService.sendEmail({
        to: user.email,
        subject: "Paiement mensuel de votre crédit",
        text: `Votre paiement mensuel de ${credit.monthlyPayment.amount} ${credit.monthlyPayment.currency} a été effectué avec succès. Solde restant : ${account.balance.amount} ${account.balance.currency}.`,
      });
    } catch (error) {
      console.error(
        `Erreur lors de l'envoi de la notification pour le crédit ${credit.id}:`,
        error
      );
    }
  }
}
