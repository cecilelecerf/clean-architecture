import { ClockService } from "@application/ports/services/ClockService";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { SeedTransactionUseCase } from "@application/usecases/seeds/SeedTransactionUseCase";
import { rand } from ".";

export async function seedTransactions(
  seedTransactionUseCase: SeedTransactionUseCase,
  accounts: AccountEntity[],
  rawAccounts: any[],
  isFirstUser: boolean,
  clockService: ClockService
): Promise<void> {
  const minTransactions = isFirstUser ? 20 : 0;
  let transactionsCreated = 0;

  console.log(
    `  Creating transactions for ${accounts.length} accounts` +
      (isFirstUser ? ` (minimum ${minTransactions} transactions)...` : "...")
  );

  for (let i = 0; i < accounts.length; i++) {
    const fromAccount = accounts[i];
    const rawAccount = rawAccounts[i];

    for (const rawTransaction of rawAccount.transactions ?? []) {
      const otherAccounts = accounts.filter(
        (a) => !a.iban.is(fromAccount.iban)
      );

      if (otherAccounts.length === 0) {
        console.warn(
          `    ⚠️  No other account available for transaction from ${fromAccount.iban.value}`
        );
        continue;
      }

      const toAccount = otherAccounts[rand(0, otherAccounts.length - 1)];

      try {
        await seedTransactionUseCase.execute({
          fromAccountId: fromAccount.iban,
          toAccountId: toAccount.iban,
          amount: rawTransaction.amount,
          currency: rawTransaction.currency,
          label: rawTransaction.label,
          icon: rawTransaction.icon,
          date: clockService.now(),
        });

        transactionsCreated++;
        console.log(
          `    ✅ Transaction ${transactionsCreated}: ${fromAccount.iban.value.slice(
            0,
            10
          )}... → ${toAccount.iban.value.slice(0, 10)}...`
        );
      } catch (err) {
        console.warn(`    ⚠️  Failed to create transaction:`, err);
      }
    }
  }

  if (isFirstUser && transactionsCreated < minTransactions) {
    const remaining = minTransactions - transactionsCreated;
    console.log(
      `  Generating ${remaining} additional transactions to reach minimum...`
    );

    const transactionLabels = [
      "Virement interne",
      "Transfert d'épargne",
      "Répartition budget",
      "Optimisation comptes",
      "Ajustement mensuel",
      "Virements automatiques",
      "Économies du mois",
      "Provision factures",
    ];

    const transactionIcons = ["💸", "💰", "🏦", "📊", "🔄", "💳"];

    for (let i = 0; i < remaining; i++) {
      const fromAccount = accounts[rand(0, accounts.length - 1)];
      const otherAccounts = accounts.filter(
        (a) => !a.iban.is(fromAccount.iban)
      );
      const toAccount = otherAccounts[rand(0, otherAccounts.length - 1)];

      try {
        const transactionDate = clockService.nowMinusDays(rand(1, 90));
        const amount = rand(10, 500);

        await seedTransactionUseCase.execute({
          fromAccountId: fromAccount.iban,
          toAccountId: toAccount.iban,
          amount,
          currency: "EUR",
          label: transactionLabels[rand(0, transactionLabels.length - 1)],
          icon: transactionIcons[rand(0, transactionIcons.length - 1)],
          date: transactionDate,
        });

        transactionsCreated++;
        console.log(
          `    ✅ Transaction ${transactionsCreated}: ${fromAccount.iban.value.slice(
            0,
            10
          )}... → ${toAccount.iban.value.slice(0, 10)}... - ${amount}€`
        );
      } catch (err) {
        console.warn(`    ⚠️  Failed to create extra transaction:`, err);
      }
    }
  }

  console.log(`  ✅ Total transactions created: ${transactionsCreated}`);
}
