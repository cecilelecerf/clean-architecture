import { UserEntity } from "@domain/entities/UserEntity";

export class ThreadParticipantAlreadyExistError extends Error {
  public readonly statusCode = 409;
  public readonly name = "ThreadParticipantAlreadyExistError";

  constructor(public readonly userId: UserEntity["id"]) {
    super(`Le participant: ${userId} existe déjà dans le thread`);
  }
}
