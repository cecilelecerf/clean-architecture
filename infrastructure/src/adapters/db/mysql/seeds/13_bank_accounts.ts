import { AccountEntity } from "@domain/entities/AccountEntity";
import { MySQLClient } from "../../MySQLClient";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { rawBankAccounts } from "../../seeds/bank_account";
import { IBAN } from "@domain/values/IBAN";
import { generateFrenchIBAN } from "../../seeds/utils";
import { Color } from "@domain/values/Color";
import { AccountOwner } from "@domain/values/AccountOwner";
import { Money } from "@domain/values/Money";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

export async function generateBankAccounts(
  mysqlClient: MySQLClient
): Promise<AccountEntity[]> {
  console.log("-- Création des comptes bancaires de la banque --");

  const accountRepository = new AccountRepositoryMySQL(mysqlClient);
  const clockService = new SystemClockService();

  const accounts: AccountEntity[] = [];

  for (const [index, raw] of rawBankAccounts.entries()) {
    try {
      const iban = IBAN.create(generateFrenchIBAN());
      if (iban instanceof Error) {
        console.warn(
          `Invalid IBAN for bank account ${index}, skipping account.`
        );
        continue;
      }

      const color = Color.from(raw.color);
      if (color instanceof Error) continue;

      const account = AccountEntity.from({
        ...raw,
        iban,
        createdAt: clockService.now(),
        color,
        owner: AccountOwner.from({
          role: "bank",
          userId: null,
        }),
        balance: Money.from({
          amount: raw.balance,
          currency: raw.currency,
        }),
        updatedAt: clockService.now(),
      });
      accounts.push(account);
      await accountRepository.save(account);
      console.log(iban.value);
    } catch (err) {
      console.error("Error creating account from raw", raw, err);
    }
  }

  return accounts;
}
