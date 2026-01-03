import { AccountEntityWithUser } from "@application/ports/repositories/AccountRepository";
import { AccountDTO } from "@domain/entities/AccountEntity";
import { UserToDTO } from "@domain/entities/UserEntity";

export type AccountDTOWithUser = AccountDTO & { user: UserToDTO | null };

export class AccountDTOMapper {
  static map(account: AccountEntityWithUser): AccountDTOWithUser {
    return Object.assign(account.toDTO(), {
      user: account.user ? account.user.toDTO() : null,
    });
  }
  static maps(accounts: AccountEntityWithUser[]): AccountDTOWithUser[] {
    return accounts.map((account) => this.map(account));
  }
}
