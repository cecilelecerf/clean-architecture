import { AccountEntity } from "@domain/entities/AccountEntity";
import { SeedBankAccountUseCase } from "@application/usecases/seeds/SeedBankAccountUseCase";
import { rawBankAccounts } from "./raw/bank_account";
import { generateFrenchIBAN } from "./utils";

export async function generateBankAccounts(
  seedBankAccountUseCase: SeedBankAccountUseCase
): Promise<AccountEntity[]> {
  console.log("-- Création des comptes bancaires de la banque --");

  const accounts: AccountEntity[] = [];

  for (const [index, raw] of rawBankAccounts.entries()) {
    try {
      const account = await seedBankAccountUseCase.execute({
        iban: generateFrenchIBAN(),
        accountType: raw.type,
        balance: raw.balance,
        currency: raw.currency,
        color: raw.color,
        userId: null,
        name: raw.name,
      });

      accounts.push(account);
      console.log(
        `  ✅ Bank account created: ${account.type} - ${account.iban.value}`
      );
    } catch (err) {
      console.warn(`  ⚠️  Failed to create bank account ${index}:`, err);
    }
  }

  console.log(`✅ Bank accounts seed completed: ${accounts.length} created\n`);
  return accounts;
}
