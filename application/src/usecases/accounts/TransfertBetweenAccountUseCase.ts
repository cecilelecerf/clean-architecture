import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";

// TODO: Modiifer la gestion des erreurs
export class TransfertBetweenAccountUsecase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  public async execute(fromAccountId: IBAN, toAccountId: IBAN, amount: Money) {
    // TODO : on récupère pas des IBAN mais des string qu'on transforme en type IBAN + vérification que le from est bien celui qui fait la requête + même principe pour l'amount
    const fromAccount = await this.accountRepository.findByIBAN(fromAccountId);
    if (!fromAccount)
      return new Error(`Compte source ${fromAccountId} introuvable`);

    const toAccount = await this.accountRepository.findByIBAN(toAccountId);
    if (!toAccount)
      return new Error(`Compte destination ${toAccountId} introuvable`);

    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    // TODO : utilisation du service uuid
    // TODO : utiliser du service clock
    const debitTransaction = TransactionEntity.from({
      id: crypto.randomUUID(),
      fromAccountId: fromAccount.iban,
      toAccountId: toAccount.iban,
      amount,
      type: "debit",
      date: new Date(),
    });

    // Pourquoi créer un crédit et un débit ?
    const creditTransaction = TransactionEntity.from({
      id: crypto.randomUUID(),
      fromAccountId: fromAccount.iban,
      toAccountId: toAccount.iban,
      amount,
      type: "credit",
      date: new Date(),
    });

    await this.transactionRepository.save(debitTransaction);
    await this.transactionRepository.save(creditTransaction);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}
