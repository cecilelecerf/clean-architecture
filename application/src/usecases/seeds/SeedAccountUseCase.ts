import { AccountEntity } from "@domain/entities/AccountEntity";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Color } from "@domain/values/Color";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { ClockService } from "@application/ports/services/ClockService";

export interface SeedAccountRequest {
  userId: string;
  iban: string;
  accountType: string;
  balance: number;
  currency: string;
  color: string;
  createdAt?: Date;
  name: string;
}

export class SeedAccountUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private clockService: ClockService
  ) {}

  async execute(request: SeedAccountRequest): Promise<AccountEntity> {
    const iban = IBAN.create(request.iban);
    if (iban instanceof Error) {
      throw new Error(`Invalid IBAN: ${request.iban}`);
    }

    const color = Color.create(request.color);
    if (color instanceof Error) {
      throw new Error(`Invalid color: ${request.color}`);
    }

    const balance = Money.create({
      amount: request.balance,
      currency: request.currency,
    });
    if (balance instanceof Error) {
      throw new Error(`Invalid balance: ${request.balance}`);
    }

    const account = AccountEntity.create({
      iban,
      userId: request.userId,
      name: request.name,
      type: request.accountType,
      balance,
      currency: request.currency,
      color,
      createdAt: request.createdAt ?? this.clockService.now(),
    });

    if (account instanceof Error) {
      throw account;
    }

    await this.accountRepository.save(account);
    return account;
  }
}
