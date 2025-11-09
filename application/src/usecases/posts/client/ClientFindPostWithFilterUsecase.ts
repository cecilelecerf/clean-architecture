import { findActiveUser } from "@application/utils/userValidators";
import { PostRepository } from "../../../ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { TagEntity } from "@domain/entities/TagEntity";
import { InvalidPaginationLimitError } from "@application/errors/posts/InvalidPaginationLimitError";

type Props = {
  fromDate?: Date;
  toDate?: Date;
  tagsId?: TagEntity["id"][];
  title?: string;
  page?: number;
  limit?: number;
  administratorId: UserEntity["id"];
};

export class ClientFindPostWithFilterUsecase {
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
    administratorId,
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
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);
    if (limit === 0) return new InvalidPaginationLimitError(limit);

    const posts =
      await this.postRepository.findAllPaginatedWithTagsAndUserByFilters(
        {
          dateFrom: fromDate,
          dateTo: toDate,
          tagsId,
          title,
          status: true,
        },
        { page, limit }
      );

    return posts;
  }
}
