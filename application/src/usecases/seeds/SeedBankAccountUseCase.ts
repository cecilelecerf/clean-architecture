import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { Color } from "@domain/values/Color";
import { Money } from "@domain/values/Money";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { ClockService } from "@application/ports/services/ClockService";

export interface SeedBankAccountRequest {
  iban: string;
  accountType: "courant" | "epargne";
  balance: number;
  name: string;
  currency: string;
  color: string;
  userId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SeedBankAccountUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private clockService: ClockService
  ) {}

  async execute(request: SeedBankAccountRequest): Promise<AccountEntity> {
    const iban = IBAN.create(request.iban);
    if (iban instanceof Error) {
      throw new Error(`Invalid IBAN: ${request.iban}`);
    }

    const color = Color.from(request.color);
    if (color instanceof Error) {
      throw new Error(`Invalid color: ${request.color}`);
    }

    const balance = Money.from({
      amount: request.balance,
      currency: request.currency,
    });

    const now = this.clockService.now();

    const account = AccountEntity.from({
      iban,
      type: request.accountType,
      balance,
      name: request.name,
      color,
      userId: null,
      createdAt: request.createdAt ?? now,
      updatedAt: request.updatedAt ?? now,
    });

    await this.accountRepository.save(account);
    return account;
  }
}
