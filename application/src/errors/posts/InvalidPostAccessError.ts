import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export class InvalidPostAccessError extends Error {
  public readonly statusCode = 403;
  constructor(userId: UserEntity["id"], postId: PostEntity["id"]) {
    super(
      `L'utilisateur ${userId} n'est pas autorisé à modifier le post : ${postId}.`
    );
    this.name = "InvalidPostAccessError";
  }
}
