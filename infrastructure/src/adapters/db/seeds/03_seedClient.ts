import { UserEntity } from "@domain/entities/UserEntity";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { SeedAccountUseCase } from "@application/usecases/seeds/SeedAccountUseCase";
import { SeedTransactionUseCase } from "@application/usecases/seeds/SeedTransactionUseCase";
import { SeedCreditUseCase } from "@application/usecases/seeds/SeedCreditUseCase";
import { rawClients } from "./raw/clients";
import { generateFrenchIBAN } from "./utils";
import { rand } from "./utils";
import { ClockService } from "@application/ports/services/ClockService";
import { SeedUserUseCase } from "@application/usecases/seeds/SeedUserRequest";
import { seedTransactions } from "./utils/seedTransactions";
import { seedCredits } from "./utils/seedCredits";

export async function seedClient(
  seedUserUseCase: SeedUserUseCase,
  seedAccountUseCase: SeedAccountUseCase,
  seedTransactionUseCase: SeedTransactionUseCase,
  seedCreditUseCase: SeedCreditUseCase,
  clockService: ClockService
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Clients --");

  const clients: UserEntity[] = [];

  for (const [index, raw] of rawClients.entries()) {
    try {
      const now = clockService.now();
      const isFirstUser = index === 0;
      const isConfirmed = isFirstUser || Math.random() < 0.5;

      const user = await seedUserUseCase.execute({
        email: raw.email,
        password: raw.password,
        firstName: raw.firstname,
        lastName: raw.lastname,
        // phoneNumber: raw.phoneNumber,
        role: "client",
        createdAt: now,
        confirmedAt: isConfirmed ? now : undefined,
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(now, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
        isActiveField: true,
      });

      clients.push(user);
      console.log(`✅ User created: ${user.email.value}`);

      const accounts: AccountEntity[] = [];
      for (const rawAccount of raw.accounts ?? []) {
        try {
          const account = await seedAccountUseCase.execute({
            userId: user.id,
            iban: generateFrenchIBAN(),
            accountType: rawAccount.type,
            name: rawAccount.name,
            balance: rawAccount.balance,
            currency: rawAccount.currency,
            color: rawAccount.color,
            createdAt: now,
          });

          accounts.push(account);
          console.log(`  ✅ Account created: ${account.iban.value}`);
        } catch (err) {
          console.warn(`  ⚠️  Failed to create account:`, err);
        }
      }

      if (accounts.length >= 2) {
        await seedTransactions(
          seedTransactionUseCase,
          accounts,
          raw.accounts ?? [],
          isFirstUser,
          clockService
        );
      } else {
        console.warn(
          `  ⚠️  User has less than 2 accounts - skipping transactions`
        );
      }

      // 4. Créer les crédits
      await seedCredits(seedCreditUseCase, user.id, raw.credits ?? []);
    } catch (err) {
      console.error(`❌ Failed to create client ${raw.email}:`, err);
    }
  }

  console.log(`✅ Clients seed completed: ${clients.length} created\n`);
  return clients;
}
