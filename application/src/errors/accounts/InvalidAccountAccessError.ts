import { AccountEntity } from "@domain/entities/AccountEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export class InvalidAccountAccessError extends Error {
  public readonly statusCode = 403;
  constructor(userId: UserEntity["id"], accountId: AccountEntity["iban"]) {
    super(
      `L'utilisateur ${userId} n'est pas autorisé à modifier le compte : ${accountId}.`
    );
    this.name = "InvalidAccountAccessError";
  }
}
