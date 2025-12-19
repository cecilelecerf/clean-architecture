import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/UserRepositoryMongo";
import { AccountRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/AccountRepositoryMongo";
import { TransactionRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/TransactionRepositoryMongo";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawClients } from "@infrastructure/adapters/db/seeds/clients";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { generateFrenchIBAN } from "@infrastructure/adapters/db/seeds/utils";
import { Color } from "@domain/values/Color";
import { AccountOwner } from "@domain/values/AccountOwner";

export async function seedMongoClient(
  mongoClient: MongoClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Client (Mongo) --");

  await mongoClient.connect();

  const userRepository = new UserRepositoryMongo(mongoClient);
  const accountRepository = new AccountRepositoryMongo(mongoClient);
  const transactionRepository = new TransactionRepositoryMongo(mongoClient);

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
      let confirmedAt: Date | undefined;

      if (index === 0 || Math.random() < 0.5) {
        confirmedAt = new Date(
          createdAt.getTime() +
            Math.random() * (Date.now() - createdAt.getTime())
        );
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
        confirmedAt,
      });

      await userRepository.save(user);
      users.push(user);

      console.log(user.email.value);

      const accounts: AccountEntity[] = [];

      for (const rawAccount of raw.accounts ?? []) {
        const iban = IBAN.create(generateFrenchIBAN());
        if (iban instanceof Error) continue;

        const color = Color.from(rawAccount.color);
        if (color instanceof Error) continue;

        const account = AccountEntity.from({
          ...rawAccount,
          iban,
          owner: AccountOwner.from({
            role: "client",
            userId: user.id,
          }),
          createdAt: clockService.now(),
          color,
          balance: Money.from({
            amount: rawAccount.balance,
            currency: rawAccount.currency,
          }),
        });

        await accountRepository.save(account);
        accounts.push(account);

        console.log(iban.value);

        for (const rawTransaction of rawAccount.transactions ?? []) {
          const recipientAccount =
            accounts.find((a) => a.iban !== account.iban) ?? account;

          const transaction = TransactionEntity.from({
            ...rawTransaction,
            id: uuidService.generate(),
            fromAccountId: account.iban,
            toAccountId: recipientAccount.iban,
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
      console.error(`Skipping user ${raw.email}`, err);
    }
  }

  return users;
}
