import { PostNotFoundError } from "@application/errors/posts/PostNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import {
  PostRepository,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
type Props = {
  userId: PostEntity["advisorId"];
  id: PostEntity["id"];
};
export class AdminFindPostByIdWithTagsUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}
  public async execute({
    userId,
    id: postId,
  }: Props): Promise<
    | PostWithTagsAndUser
    | UserNotFoundError
    | UserNotActiveError
    | PostNotFoundError
    | UserRoleMismatchError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);

    const post = await this.feedRepository.findWithTagsAndUserById(postId);
    if (!post) return new PostNotFoundError();

    return post;
  }
}
