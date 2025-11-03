import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawClients } from "@infrastructure/adapters/db/seeds/raws/clients";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { generateFrenchIBAN } from "../utils";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { AccountRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/AccountRepositoryMysql";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { TransactionRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/TransactionRepositoryMySQL";

export async function seedSQLClient(mysqlClient: MySQLClient) {
  console.log("🌱 Client");

  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const accountRepository = new AccountRepositoryMySQL(mysqlClient);
  const transactionRepository = new TransactionRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  for (const raw of rawClients) {
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) return;
      const passwordHash = await hasher.hash(raw.password);
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
        role: "client",
        createdAt: clockService.now(),
        isActiveField: true,
      });
      await userRepository.save(user);
      console.log(`============${user.email.value}, SAVE=========`);

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
        console.log(`--- ${iban.value}`);
        accounts.push(account);
        await accountRepository.save(account);

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

          console.log(`- ${transaction.id}`);
          await transactionRepository.save(transaction);
        }
      }
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
}
