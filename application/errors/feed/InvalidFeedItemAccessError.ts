import { FeedItemEntity } from "@domain/entities/FeedItemEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export class InvalidFeedItemAccessError extends Error {
  constructor(userId: UserEntity["id"], feedItemId: FeedItemEntity["id"]) {
    super(
      `L'utilisateur ${userId} n'est pas autorisé à modifier l'item du feed ${feedItemId}.`
    );
    this.name = "InvalidFeedItemAccessError";
  }
}
