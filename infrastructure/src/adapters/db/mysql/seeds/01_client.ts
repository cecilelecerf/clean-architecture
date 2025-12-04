import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_client.ts
import { rawDirectors } from "../../seeds/director";
=======
import { rawClients } from "@infrastructure/adapters/db/seeds/raws/clients";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { generateFrenchIBAN } from "../utils";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { AccountRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/AccountRepositoryMysql";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/TransactionRepositoryMySQL";
>>>>>>> 6d4e8ed (clean mysql create db):infrastructure/src/adapters/db/seeds/mysql/01_client.ts

<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_client.ts
<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
export async function seedSQLDirector(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Directeurs --");
========
export async function seedSQLClient(mysqlClient: MySQLClient) {
  console.log("🌱 Client");
=======
export async function seedSQLClient(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Client --");
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/01_client.ts

>>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/mysql/seeds/01_client.ts
=======
import { rawClients } from "@infrastructure/adapters/db/seeds/clients";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { AccountRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/AccountRepositoryMysql";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/TransactionRepositoryMySQL";
import { generateFrenchIBAN } from "@infrastructure/adapters/db/seeds/utils";

export async function seedSQLClient(
  mysqlClient: MySQLClient,
  advisors: UserEntity[]
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Client --");

>>>>>>> 2ce9cab (thread)
  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const accountRepository = new AccountRepositoryMySQL(mysqlClient);
  const transactionRepository = new TransactionRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_client.ts
  const users = [];
  for (const raw of rawDirectors) {
    try {
      const email = Email.create(raw.email);
=======
  const users: UserEntity[] = [];

  for (const raw of rawClients) {
    try {
      const email = Email.create(raw.email);

>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/01_client.ts
=======
  const users: UserEntity[] = [];

  for (const [index, raw] of rawClients.entries()) {
    try {
      const email = Email.create(raw.email);

>>>>>>> 2ce9cab (thread)
      if (email instanceof Error) {
        console.warn(email);
        continue;
      }
<<<<<<< HEAD
=======
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
>>>>>>> 2ce9cab (thread)
      const passwordHash = await hasher.hash(raw.password);
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
<<<<<<< HEAD
        role: "directeur",
        createdAt: clockService.now(),
        isActiveField: true,
      });
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_client.ts
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_client.ts
<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts

      users.push(user);
========
      console.log(user);
>>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/mysql/seeds/01_client.ts
      userRepository.save(user);
      console.log(user.id);
=======
=======
      users.push(user);
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/01_client.ts
=======
        role: "client",
        createdAt,
        isActiveField: true,
        confirmedAt,
      });
      users.push(user);
>>>>>>> 2ce9cab (thread)
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
        const account = AccountEntity.from({
          ...rawAccount,
          iban,
          createdAt: clockService.now(),
          userId: user.id,
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
<<<<<<< HEAD
>>>>>>> 6d4e8ed (clean mysql create db):infrastructure/src/adapters/db/seeds/mysql/01_client.ts
=======
>>>>>>> 2ce9cab (thread)
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
  return users;
}
