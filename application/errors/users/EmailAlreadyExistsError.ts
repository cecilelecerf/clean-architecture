import { Email } from "@domain/values/Email";

export class EmailAlreadyExistsError extends Error {
  public readonly name = "EmailAlreadyExistsError";

  constructor(public readonly email: Email) {
    super(`The email "${email}" is already in use.`);
  }
}
