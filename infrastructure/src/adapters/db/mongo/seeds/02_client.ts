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
import { CreditEntity, CreditStatus } from "@domain/entities/CreditEntity";
import { Percentage } from "@domain/values/Percentage";
import { CreditRepositoryMongo } from "../repositories/CreditRepositoryMongo";

export async function seedMongoClient(
  mongoClient: MongoClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Client (Mongo) --");

  await mongoClient.connect();

  const userRepository = new UserRepositoryMongo(mongoClient);
  const accountRepository = new AccountRepositoryMongo(mongoClient);
  const transactionRepository = new TransactionRepositoryMongo(mongoClient);
  const creditRepository = new CreditRepositoryMongo(mongoClient);

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
        updatedAt: clockService.now(),
      });

      await userRepository.save(user);
      users.push(user);

      console.log(user.email.value);

      const accounts: AccountEntity[] = [];

      for (const rawAccount of raw.accounts ?? []) {
        const iban = IBAN.create(generateFrenchIBAN());
        if (iban instanceof Error) continue;

        const color = Color.create(rawAccount.color);
        if (color instanceof Error) continue;

        const balance = Money.create({
            amount: rawAccount.balance,
            currency: rawAccount.currency,
          });
          if (balance instanceof Error) {console.warn(balance); continue};


        const account = AccountEntity.from({
          ...rawAccount,
          iban,
          userId: user.id,
          createdAt: clockService.now(),
          color,
          balance,
          currency: rawAccount.currency,
          updatedAt: clockService.now(),
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

      const credits: CreditEntity[] = [];
      for (const rawCredit of raw.credits ?? []) {
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

        const credit = CreditEntity.from({
          id: uuidService.generate(),
          advisorId: null,
          userId: user.id,
          initialAmount: initialAmount,
          interestRate: interestRate,
          insuranceRate: insuranceRate,
          durationMonths: rawCredit.durationMonths,
          startDate: rawCredit.startDate,
          status: CreditStatus.PENDING,
          updatedAt:
            status === CreditStatus.PENDING ? createdAt : clockService.now(),
          createdAt: clockService.now(),
          monthlyPayment: 
        });

        if (credit instanceof Error) {
          console.warn(credit);
          continue;
        }

        credits.push(credit);
        await creditRepository.save(credit);
        console.log(credit.id);
      }
    } catch (err) {
      console.error(`Skipping user ${raw.email}`, err);
    }
  }

  return users;
}
