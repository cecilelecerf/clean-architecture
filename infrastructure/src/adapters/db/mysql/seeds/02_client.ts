import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawClients } from "@infrastructure/adapters/db/seeds/clients";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { AccountRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/AccountRepositoryMysql";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/TransactionRepositoryMySQL";
import { generateFrenchIBAN } from "@infrastructure/adapters/db/seeds/utils";
import { Color } from "@domain/values/Color";
import { rand } from "./utils";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { Percentage } from "@domain/values/Percentage";
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";

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

      // Premier user => toujours confirmé
      if (index === 0) {
        confirmedAt = new Date(
          createdAt.getTime() +
            Math.random() * (Date.now() - createdAt.getTime())
        );
      } else {
        // Pour les autres, une chance sur 2 d’être confirmé
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
      console.log(user.email.value);

      const accounts: AccountEntity[] = [];
      for (const rawAccount of raw.accounts ?? []) {
        const iban = IBAN.create(generateFrenchIBAN());
        if (iban instanceof Error) {
          console.warn(
            `Invalid IBAN for user ${user.email.value}, skipping account.`
          );
          continue;
        }

        const color = Color.from(rawAccount.color);
        if (color instanceof Error) continue;

        const account = AccountEntity.from({
          ...rawAccount,
          iban,
          createdAt: clockService.now(),
          color,
          userId: user.id,
          balance: Money.from({
            amount: rawAccount.balance,
            currency: rawAccount.currency,
          }),
          currency: rawAccount.currency,
          updatedAt: clockService.now(),
        });
        accounts.push(account);
        await accountRepository.save(account);
        console.log(iban.value);

        for (const rawTransaction of rawAccount.transactions ?? []) {
          const recipientAccount = accounts.find(
            (a) => a.iban !== account.iban
          );
          const transaction = TransactionEntity.from({
            ...rawTransaction,
            id: uuidService.generate(),
            fromAccountId: account.iban,
            toAccountId: recipientAccount?.iban ?? account.iban,
            amount: Money.from({
              amount: rawTransaction.amount,
              currency: rawTransaction.currency,
            }),
          });

          await transactionRepository.save(transaction);
          console.log(transaction.id);
        }
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

        // Déterminer le statut et gérer les dates
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
          const monthsElapsed = rand(3, 12); // Entre 3 et 12 mois écoulés
          startDate = clockService.nowMinusMonths(monthsElapsed);
          createdAt = clockService.addDays(startDate, -rand(30, 90)); // Créé 1-3 mois avant le début
        }
        // Deuxième crédit => PENDING (en attente d'acceptation par admin)
        else if (creditIndex === 1) {
          status = CreditStatus.PENDING;
          creditType = "pending";
          createdAt = clockService.nowMinusDays(rand(1, 15)); // Créé il y a 1-15 jours
          startDate = clockService.addDays(clockService.now(), rand(30, 60)); // Début prévu dans 1-2 mois SI accepté
        }
        // Troisième crédit => ACCEPTED FUTUR (accepté mais pas encore démarré)
        else if (creditIndex === 2) {
          status = CreditStatus.ACCEPTED;
          creditType = "future";
          createdAt = clockService.nowMinusDays(rand(15, 45)); // Créé il y a 2-6 semaines
          startDate = clockService.addDays(clockService.now(), rand(60, 180)); // Début dans 2-6 mois
        }
        // Quatrième crédit => REFUSED (refusé il y a quelques semaines)
        else if (creditIndex === 3) {
          status = CreditStatus.REFUSED;
          creditType = "refused";
          createdAt = clockService.nowMinusDays(rand(20, 60)); // Créé il y a 20-60 jours
          startDate = clockService.addDays(createdAt, rand(30, 60)); // Date de début qui n'aura jamais lieu
        }
        // Cinquième crédit => COMPLETED (terminé)
        else if (creditIndex === 4) {
          status = CreditStatus.COMPLETED;
          creditType = "completed";
          const totalMonths = rawCredit.durationMonths;
          startDate = clockService.nowMinusMonths(totalMonths + rand(1, 6)); // Terminé il y a 1-6 mois
          createdAt = clockService.addDays(startDate, -rand(30, 90));
        }
        // Crédits suivants => distribution aléatoire
        else {
          const random = Math.random();
          if (random < 0.25) {
            // ACCEPTED ACTIF (25%)
            status = CreditStatus.ACCEPTED;
            creditType = "active";
            const monthsElapsed = rand(1, rawCredit.durationMonths - 1);
            startDate = clockService.nowMinusMonths(monthsElapsed);
            createdAt = clockService.addDays(startDate, -rand(30, 90));
          } else if (random < 0.4) {
            // ACCEPTED FUTUR (15%)
            status = CreditStatus.ACCEPTED;
            creditType = "future";
            createdAt = clockService.nowMinusDays(rand(7, 60));
            startDate = clockService.addDays(clockService.now(), rand(30, 180));
          } else if (random < 0.6) {
            // PENDING (20%)
            status = CreditStatus.PENDING;
            creditType = "pending";
            createdAt = clockService.nowMinusDays(rand(1, 30));
            startDate = clockService.addDays(clockService.now(), rand(30, 90));
          } else if (random < 0.8) {
            // REFUSED (20%)
            status = CreditStatus.REFUSED;
            creditType = "refused";
            createdAt = clockService.nowMinusDays(rand(15, 90));
            startDate = clockService.addDays(createdAt, rand(30, 60));
          } else {
            // COMPLETED (20%)
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

        // Calculer et mettre à jour le solde restant selon le type
        if (creditType === "active") {
          // ACCEPTED ACTIF : Calculer le solde restant réel
          const monthsElapsed = Math.floor(
            (clockService.now().getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          );
          const monthsRemaining = Math.max(
            0,
            rawCredit.durationMonths - monthsElapsed
          );

          // Solde restant = mensualités restantes
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
          // Mettre à jour le remainingBalance
          credit.remainingBalance = remainingBalance;
        } else if (creditType === "future") {
          // ACCEPTED FUTUR : Le solde reste le montant total (pas encore démarré)
          // credit.updateRemainingBalance(credit.initialAmount);
        } else if (creditType === "completed") {
          // COMPLETED : Solde à 0
          // credit.updateRemainingBalance(Money.create({
          //   amount: 0,
          //   currency: credit.initialAmount.currency
          // }));
        }
        // Pour PENDING et REFUSED, le remainingBalance reste égal au montant total par défaut
        console.log(credit);
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
          `${credit.id} - Status: ${status} ${typeLabel} - Start: ${startDateStr} - Created: ${createdAtStr}`
        );
      }
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
  return users;
}
