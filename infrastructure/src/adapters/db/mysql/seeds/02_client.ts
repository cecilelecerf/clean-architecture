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
import { AccountOwner } from "@domain/values/AccountOwner";

export async function seedSQLClient(
  mysqlClient: MySQLClient,
  advisors: UserEntity[]
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Client --");

  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const accountRepository = new AccountRepositoryMySQL(mysqlClient);
  const transactionRepository = new TransactionRepositoryMySQL(mysqlClient);
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
                                   confirmedAt : confirmedAt ?? new Date(createdAt),   
        updatedAt:   Math.random() < 0.3? clockService.addDays(createdAt, rand(1, 10))
                                                        :  clockService.nowMinusDays(rand(0, 60))
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
          owner: AccountOwner.from({
            role: 'client',
            userId: user.id
          }),
          balance: Money.from({
            amount: rawAccount.balance,
            currency: rawAccount.currency,
          }),
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
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
  return users;
}
