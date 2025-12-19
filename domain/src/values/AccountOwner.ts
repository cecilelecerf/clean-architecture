import { InvalidAccountOwnerError } from "@domain/errors/account";

export type AccountOwnerRole = "bank" | "client";

export class AccountOwner {
  public readonly role: AccountOwnerRole;
  public readonly userId?: string | null;

  private constructor(role: AccountOwnerRole, userId?: string | null) {
    this.role = role;
    this.userId = userId;
  }

  public static from({
    role,
    userId,
  }: Pick<AccountOwner, "role" | "userId">): AccountOwner {
    return new AccountOwner(role, userId);
  }

  public static create(params: {
    role: AccountOwnerRole;
    userId?: string;
  }): AccountOwner | InvalidAccountOwnerError {
    const { role, userId } = params;

    if (role === "bank") {
      if (userId) {
        return new InvalidAccountOwnerError();
      }
      return new AccountOwner("bank");
    }

    if (role === "client") {
      if (!userId || userId.trim().length === 0) {
        return new InvalidAccountOwnerError();
      }
      return new AccountOwner("client", userId);
    }

    return new InvalidAccountOwnerError();
  }

  public isBank(): boolean {
    return this.role === "bank";
  }

  public isClient(): boolean {
    return this.role === "client";
  }

  public belongsTo(userId: string): boolean {
    return this.role === "client" && this.userId === userId;
  }

  public is(other: AccountOwner): boolean {
    return (
      this.role === other.role &&
      this.userId === other.userId
    );
  }
}
