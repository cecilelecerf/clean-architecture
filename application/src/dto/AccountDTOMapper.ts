import { AccountEntityWithUser } from "@application/ports/repositories/AccountRepository";
import { AccountDTO } from "@domain/entities/AccountEntity";
import { UserToFront } from "@domain/entities/UserEntity";

export type AccountDTOWithUser = AccountDTO & { user: UserToFront | null };

export class AccountDTOMapper {
  static map(account: AccountEntityWithUser): AccountDTOWithUser {
    return Object.assign(account.toDTO(), {
      user: account.user ? account.user.toFront() : null,
    });
  }
  static maps(accounts: AccountEntityWithUser[]): AccountDTOWithUser[] {
    return accounts.map((account) => this.map(account));
  }
}
