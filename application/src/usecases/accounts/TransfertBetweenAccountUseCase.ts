import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";

// TODO: Modiifer la gestion des erreurs
export class TransfertBetweenAccountUsecase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly clockService: ClockService,
    private readonly uuidService: UuidService
  ) {}

  public async execute(fromAccountId: IBAN, toAccountId: IBAN, amount: Money, label: string, icon: string) {
    // TODO : on récupère pas des IBAN mais des string qu'on transforme en type IBAN + vérification que le from est bien celui qui fait la requête + même principe pour l'amount
    const fromAccount = await this.accountRepository.findByIBAN(fromAccountId);
    if (!fromAccount)
      return new Error(`Compte source ${fromAccountId} introuvable`);

    const toAccount = await this.accountRepository.findByIBAN(toAccountId);
    if (!toAccount)
      return new Error(`Compte destination ${toAccountId} introuvable`);

    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    const debitTransaction = TransactionEntity.from({
      id: this.uuidService.generate(),
      fromAccountId: fromAccount.iban,
      label: label,
      icon: icon,
      toAccountId: toAccount.iban,
      amount,
      type: "debit",
      date: this.clockService.now(),
    });

    // Pourquoi créer un crédit et un débit ?
    const creditTransaction = TransactionEntity.from({
      id: this.uuidService.generate(),
      label: label,
      icon: icon,
      fromAccountId: fromAccount.iban,
      toAccountId: toAccount.iban,
      amount,
      type: "credit",
      date: this.clockService.now(),
    });

    await this.transactionRepository.save(debitTransaction);
    await this.transactionRepository.save(creditTransaction);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}
