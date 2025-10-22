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
    const rate = await this.configRepository.findCurrentRate();
    if (!rate) throw new Error("Aucun taux d’épargne défini");

    const savingsAccounts = await this.accountRepository.findAllSavingsAccounts();
    const today = new Date();

    if(savingsAccounts){
        for (const account of savingsAccounts) {
        if (account.balance.amount <= 0) continue;

        const dailyRateDecimal = rate.rate.toDecimal() / 365;
        const interestResult = account.balance.multiply(dailyRateDecimal);

       
        if (interestResult instanceof Error) continue;
        const interestMoney = interestResult;

        account.deposit(interestMoney);

        const transaction = TransactionEntity.from({
            id: crypto.randomUUID(),
            fromAccountId: "BANK",
            toAccountId: account.iban,
            amount: interestMoney,
            type: "credit",
            date: today
        });

        await this.transactionRepository.saveTransaction(transaction);
        await this.accountRepository.saveAccount(account);
        }
    }
    
  }
}