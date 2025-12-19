import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MongoClient } from "../../MongoClient";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { rawBankAccounts } from "../../seeds/bank_account";
import { IBAN } from "@domain/values/IBAN";
import { generateFrenchIBAN } from "../../seeds/utils";
import { Color } from "@domain/values/Color";
import { AccountOwner } from "@domain/values/AccountOwner";
import { Money } from "@domain/values/Money";

export async function generateBankAccountsMongo(
  mongoClient: MongoClient
): Promise<AccountEntity[]> {
    console.log("-- Création des comptes bancaires de la banque (Mongo) --");

    await mongoClient.connect();

    const accountRepository = new AccountRepositoryMongo(mongoClient);
    const clockService = new SystemClockService();

    const accounts: AccountEntity[] = [];
    
    for (const [index, raw] of rawBankAccounts.entries()) {
        try {
            const iban = IBAN.create(generateFrenchIBAN());
            if (iban instanceof Error) continue;
            
            const color = Color.from(raw.color);
            if (color instanceof Error) continue

            const account = AccountEntity.from({
                ...raw,
                iban,
                owner: AccountOwner.from({
                    role: 'bank',
                    userId: null
                }),
                createdAt: clockService.now(),
                color,
                balance: Money.from({
                    amount: raw.balance,
                    currency: raw.currency,
                })
            });

            await accountRepository.save(account);
            accounts.push(account);
            console.log(iban.value);
        } catch (err) {
            console.error("Error creating account from raw", raw, err);
        }
    }

    return accounts;
}