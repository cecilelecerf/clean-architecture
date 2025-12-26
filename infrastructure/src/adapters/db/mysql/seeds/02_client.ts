import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { rand } from "./utils";
import { Percentage } from "@domain/values/Percentage";
import { Money } from "@domain/values/Money";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { generateFrenchIBAN } from "../../seeds/utils";
import { IBAN } from "@domain/values/IBAN";
import { Color } from "@domain/values/Color";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { Email } from "@domain/values/Email";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MySQLClient } from "../../MySQLClient";
import { rawClients } from "../../seeds/clients";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";

export async function seedSQLClient(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Client --");

  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const accountRepository = new AccountRepositoryMySQL(mysqlClient);
  const transactionRepository = new TransactionRepositoryMySQL(mysqlClient);
  const creditRepository = new CreditRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const users: UserEntity[] = [];

  for (const [index, raw] of rawClients.entries()) {
    try {
      const email = Email.create(raw.email);

      if (email instanceof Error) {
        console.warn(email);
        continue;
      }
      const createdAt = clockService.now();
      let confirmedAt: Date | undefined = undefined;

      if (index === 0) {
        confirmedAt = new Date(
          createdAt.getTime() +
            Math.random() * (Date.now() - createdAt.getTime())
        );
      } else {
        if (Math.random() < 0.5) {
          confirmedAt = new Date(
            createdAt.getTime() +
              Math.random() * (Date.now() - createdAt.getTime())
          );
        }
      }

      const passwordHash = await hasher.hash(raw.password);
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
        role: "client",
        createdAt,
        isActiveField: true,
        confirmedAt: confirmedAt ?? new Date(createdAt),
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(createdAt, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
      });
      users.push(user);
      await userRepository.save(user);
      console.log(`User created: ${user.email.value}`);

      const accounts: AccountEntity[] = [];
      for (const rawAccount of raw.accounts ?? []) {
        const iban = IBAN.create(generateFrenchIBAN());
        if (iban instanceof Error) {
          console.warn(
            `Invalid IBAN for user ${user.email.value}, skipping account.`
          );
          continue;
        }

        const color = Color.create(rawAccount.color);
        if (color instanceof Error) {
          console.warn(`Invalid color for account, skipping.`);
          continue;
        }
        const balance = Money.create({
          amount: rawAccount.balance,
          currency: rawAccount.currency,
        });

        if (balance instanceof Error) {
          console.warn(`Invalid balence for account, skipping.`);
          continue;
        }

        const account = AccountEntity.create({
          ...rawAccount,
          iban,
          createdAt: clockService.now(),
          color,
          userId: user.id,
          balance,
          currency: rawAccount.currency,
        });

        if (account instanceof Error) {
          console.warn(`Invalid account, skipping.`);
          continue;
        }
        accounts.push(account);
        await accountRepository.save(account);
        console.log(`  Account created: ${iban.value}`);
      }

      if (accounts.length >= 2) {
        const isUser0 = index === 0;
        const minTransactionsTotal = isUser0 ? 20 : 0;

        console.log(
          `  Creating transactions for ${accounts.length} accounts` +
            (isUser0
              ? ` (minimum ${minTransactionsTotal} transactions)...`
              : "...")
        );

        let totalTransactionsCreated = 0;

        for (let i = 0; i < accounts.length; i++) {
          const fromAccount = accounts[i];
          const rawAccount = raw.accounts![i];

          for (const rawTransaction of rawAccount.transactions ?? []) {
            const otherAccounts = accounts.filter(
              (a) => !a.iban.is(fromAccount.iban)
            );

            if (otherAccounts.length === 0) {
              console.warn(
                `    No other account available for transaction from ${fromAccount.iban.value}`
              );
              continue;
            }

            const amount = Money.create({
              amount: rawTransaction.amount,
              currency: rawTransaction.currency,
            });
            if (amount instanceof Error) {
              console.warn(`Error amount intransaction}`);
              continue;
            }
            const toAccount = otherAccounts[rand(0, otherAccounts.length - 1)];

            const transaction = TransactionEntity.create({
              ...rawTransaction,
              id: uuidService.generate(),
              fromAccountId: fromAccount.iban,
              toAccountId: toAccount.iban,
              amount,
              date: clockService.now(),
            });

            if (transaction instanceof Error) {
              console.warn(`Invalid transaction for account, skipping.`);
              continue;
            }
            await transactionRepository.save(transaction);
            totalTransactionsCreated++;
            console.log(
              `    Transaction ${totalTransactionsCreated}: ${
                transaction.id
              } (${fromAccount.iban.value.slice(
                0,
                10
              )}... → ${toAccount.iban.value.slice(0, 10)}...)`
            );
          }
        }

        if (isUser0 && totalTransactionsCreated < minTransactionsTotal) {
          const remainingTransactions =
            minTransactionsTotal - totalTransactionsCreated;
          console.log(
            `  Generating ${remainingTransactions} additional transactions to reach minimum...`
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

          for (let i = 0; i < remainingTransactions; i++) {
            const fromAccount = accounts[rand(0, accounts.length - 1)];

            const otherAccounts = accounts.filter(
              (a) => !a.iban.is(fromAccount.iban)
            );
            const toAccount = otherAccounts[rand(0, otherAccounts.length - 1)];

            const amount = Money.create({
              amount: rand(10, 500),
              currency: "EUR",
            });

            if (amount instanceof Error) {
              console.warn(`Invalid amount for account, skipping.`);
              continue;
            }
            const transactionDate = clockService.nowMinusDays(rand(1, 90));

            const transaction = TransactionEntity.create({
              id: uuidService.generate(),
              fromAccountId: fromAccount.iban,
              toAccountId: toAccount.iban,
              amount,
              label: transactionLabels[rand(0, transactionLabels.length - 1)],
              icon: transactionIcons[rand(0, transactionIcons.length - 1)],
              date: transactionDate,
            });

            if (transaction instanceof Error) {
              console.warn(`Invalid transaction for account, skipping.`);
              continue;
            }
            await transactionRepository.save(transaction);
            totalTransactionsCreated++;
            console.log(
              `    Transaction ${totalTransactionsCreated}: ${
                transaction.id
              } (${fromAccount.iban.value.slice(
                0,
                10
              )}... → ${toAccount.iban.value.slice(0, 10)}...) - ${
                amount.amount
              }€`
            );
          }
        }

        console.log(
          `   Total transactions created: ${totalTransactionsCreated}`
        );
      } else {
        console.warn(
          `  User ${user.email.value} has less than 2 accounts - skipping transactions`
        );
      }

      const credits: CreditEntity[] = [];
      for (const [creditIndex, rawCredit] of (raw.credits ?? []).entries()) {
        const initialAmount = Money.create({
          amount: rawCredit.initialAmount,
          currency: rawCredit.currency,
        });
        if (initialAmount instanceof Error) {
          console.warn(initialAmount);
          continue;
        }

        const interestRate = Percentage.create(rawCredit.interestRate);
        if (interestRate instanceof Error) {
          console.warn(interestRate);
          continue;
        }

        const insuranceRate = Percentage.create(rawCredit.insuranceRate);
        if (insuranceRate instanceof Error) {
          console.warn(insuranceRate);
          continue;
        }

        let status: CreditStatus;
        let startDate: Date;
        let createdAt: Date;
        let creditType:
          | "active"
          | "future"
          | "pending"
          | "refused"
          | "completed" = "active";

        // Premier crédit => ACCEPTED ACTIF (en cours depuis plusieurs mois)
        if (creditIndex === 0) {
          status = CreditStatus.ACCEPTED;
          creditType = "active";
          const monthsElapsed = rand(3, 12);
          startDate = clockService.nowMinusMonths(monthsElapsed);
          createdAt = clockService.addDays(startDate, -rand(30, 90));
        }
        // Deuxième crédit => PENDING (en attente d'acceptation par admin)
        else if (creditIndex === 1) {
          status = CreditStatus.PENDING;
          creditType = "pending";
          createdAt = clockService.nowMinusDays(rand(1, 15));
          startDate = clockService.addDays(clockService.now(), rand(30, 60));
        }
        // Troisième crédit => ACCEPTED FUTUR (accepté mais pas encore démarré)
        else if (creditIndex === 2) {
          status = CreditStatus.ACCEPTED;
          creditType = "future";
          createdAt = clockService.nowMinusDays(rand(15, 45));
          startDate = clockService.addDays(clockService.now(), rand(60, 180));
        }
        // Quatrième crédit => REFUSED (refusé il y a quelques semaines)
        else if (creditIndex === 3) {
          status = CreditStatus.REFUSED;
          creditType = "refused";
          createdAt = clockService.nowMinusDays(rand(20, 60));
          startDate = clockService.addDays(createdAt, rand(30, 60));
        }
        // Cinquième crédit => COMPLETED (terminé)
        else if (creditIndex === 4) {
          status = CreditStatus.COMPLETED;
          creditType = "completed";
          const totalMonths = rawCredit.durationMonths;
          startDate = clockService.nowMinusMonths(totalMonths + rand(1, 6));
          createdAt = clockService.addDays(startDate, -rand(30, 90));
        }
        // Crédits suivants => distribution aléatoire
        else {
          const random = Math.random();
          if (random < 0.25) {
            status = CreditStatus.ACCEPTED;
            creditType = "active";
            const monthsElapsed = rand(1, rawCredit.durationMonths - 1);
            startDate = clockService.nowMinusMonths(monthsElapsed);
            createdAt = clockService.addDays(startDate, -rand(30, 90));
          } else if (random < 0.4) {
            status = CreditStatus.ACCEPTED;
            creditType = "future";
            createdAt = clockService.nowMinusDays(rand(7, 60));
            startDate = clockService.addDays(clockService.now(), rand(30, 180));
          } else if (random < 0.6) {
            status = CreditStatus.PENDING;
            creditType = "pending";
            createdAt = clockService.nowMinusDays(rand(1, 30));
            startDate = clockService.addDays(clockService.now(), rand(30, 90));
          } else if (random < 0.8) {
            status = CreditStatus.REFUSED;
            creditType = "refused";
            createdAt = clockService.nowMinusDays(rand(15, 90));
            startDate = clockService.addDays(createdAt, rand(30, 60));
          } else {
            status = CreditStatus.COMPLETED;
            creditType = "completed";
            const totalMonths = rawCredit.durationMonths;
            startDate = clockService.nowMinusMonths(totalMonths + rand(1, 12));
            createdAt = clockService.addDays(startDate, -rand(30, 90));
          }
        }

        const credit = CreditEntity.create({
          id: uuidService.generate(),
          advisorId: null,
          userId: user.id,
          initialAmount: initialAmount,
          interestRate: interestRate,
          insuranceRate: insuranceRate,
          durationMonths: rawCredit.durationMonths,
          startDate: startDate,
          status: status,
          updatedAt:
            status === CreditStatus.PENDING ? createdAt : clockService.now(),
          createdAt: createdAt,
        });

        if (credit instanceof Error) {
          console.warn(credit);
          continue;
        }

        if (creditType === "active") {
          const monthsElapsed = Math.floor(
            (clockService.now().getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          );
          const monthsRemaining = Math.max(
            0,
            rawCredit.durationMonths - monthsElapsed
          );

          const remainingAmount = Math.max(
            0,
            credit.monthlyPayment.amount * monthsRemaining
          );

          const remainingBalance = Money.create({
            amount: remainingAmount,
            currency: credit.initialAmount.currency,
          });
          if (remainingBalance instanceof Error) {
            console.warn(remainingBalance);
            continue;
          }
          credit.remainingBalance = remainingBalance;
        }

        credits.push(credit);
        await creditRepository.save(credit);

        const startDateStr = startDate.toISOString().split("T")[0];
        const createdAtStr = createdAt.toISOString().split("T")[0];
        const typeLabel =
          creditType === "active"
            ? "(ACTIF)"
            : creditType === "future"
            ? "(FUTUR)"
            : `(${creditType.toUpperCase()})`;

        console.log(
          `  Credit: ${credit.id} - Status: ${status} ${typeLabel} - Start: ${startDateStr} - Created: ${createdAtStr}`
        );
      }
    } catch (err) {
      console.error(`Skipping user ${raw.email} – error:`, err);
    }
  }

  console.log(`\n✅ Seed completed: ${users.length} users created`);
  return users;
}
