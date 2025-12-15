import { findActiveUser } from "@application/utils/userValidators";
import { PostRepository } from "../../ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { PostEntity } from "@domain/entities/PostEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { InvalidPaginationLimitError } from "@application/errors/posts/InvalidPaginationLimitError";

type Props = {
  fromDate?: Date;
  toDate?: Date;
  tagsId?: TagEntity["id"][];
  title?: string;
  page?: number;
  limit?: number;
  userId: UserEntity["id"];
  status?: boolean;
};

export class FindPostWithFilterUsecase {
  constructor(
    private postRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    fromDate,
    toDate,
    tagsId,
    title,
    page = 1,
    limit = 10,
    userId,
    status,
  }: Props): Promise<
    | {
        posts: PostEntity[];
        total: number;
      }
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | InvalidPaginationLimitError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (limit === 0) return new InvalidPaginationLimitError(limit);
    let effectiveStatus = status;

    if (user.hasRole({ role: "client" })) {
      effectiveStatus = true;
    }
    const posts =
      await this.postRepository.findAllPaginatedWithTagsAndUserByFilters(
        {
          dateFrom: fromDate,
          dateTo: toDate,
          tagsId,
          title,
          status: effectiveStatus,
        },
        { page, limit }
      );

    return posts;
  }
}
