import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export class InvalidThreadAccessError extends Error {
  public readonly statusCode = 403;
  constructor(userId: UserEntity["id"], threadId: ThreadEntity["id"]) {
    super(
      `L'utilisateur ${userId} n'est pas autorisé à accéder au thread ${threadId}.`
    );
    this.name = "InvalidThreadAccessError";
  }
}
