import { findActiveUser } from "@application/utils/userValidators";
import { PostRepository } from "../../ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";

type Props = {
  fromDate?: Date;
  toDate?: Date;
  tags?: string[];
  name?: string;
  published?: boolean;
  page?: number;
  limit?: number;
  administratorId: UserEntity["id"];
};

export class AdminFindPostWithFilterUsecase {
  constructor(
    private postRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    fromDate,
    toDate,
    tags,
    name,
    page = 1,
    published,
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
  > {
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);
    console.log(page, limit);
    const posts =
      await this.postRepository.findAllPaginatedWithTagsAndUserByFilters(
        {
          dateFrom: fromDate,
          dateTo: toDate,
          tags,
          name,
          published,
        },
        { page, limit }
      );
    return posts;
  }
}
