import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { ConfigRepository } from "@application/ports/repositories/ConfigRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";

export class ApplyDailyInterestUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly configRepository: ConfigRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(): Promise<void> {
    const rate = await this.configRepository.findCurrent();
    // TODO : faire un fichier d'error
    if (!rate) throw new Error("Aucun taux d’épargne défini");

    const savingsAccounts =
      await this.accountRepository.findAllSavingsAccounts();
    // TODO: utiliser le service clock
    const today = new Date();

    if (savingsAccounts) {
      for (const account of savingsAccounts) {
        // TODO : déjà vérifier car balance et de type Money
        if (account.balance.amount <= 0) continue;

        const dailyRateDecimal = rate.rate.toDecimal() / 365;
        const interestResult = account.balance.multiply(dailyRateDecimal);

        if (interestResult instanceof Error) continue;
        const interestMoney = interestResult;

        account.deposit(interestMoney);

        const transaction = TransactionEntity.from({
          // TODO: utiliser le service uuid
          id: crypto.randomUUID(),
          // TODO : il faut passer un id de user en ay  ant faire les verifs necesaire au prélable
          fromAccountId: "BANK",
          toAccountId: account.iban,
          amount: interestMoney,
          type: "credit",
          date: today,
        });

        await this.transactionRepository.save(transaction);
        await this.accountRepository.save(account);
      }
    }
  }
}
