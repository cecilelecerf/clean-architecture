import { PostNotFoundError } from "@application/src/errors/posts/PostNotFoundError";
import { InvalidPostAccessError } from "@application/src/errors/posts/InvalidPostAccessError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/src/errors/users/UserRoleMismatchError";
import { PostRepository } from "@application/src/ports/repositories/PostRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { findActiveUser } from "@application/src/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
type Props = { userId: PostEntity["advisorId"] } & Pick<PostEntity, "id">;
export class DeleteMessageInPostUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}
  public async execute({
    userId,
    id: postId,
  }: Props): Promise<
    | string
    | UserNotFoundError
    | UserNotActiveError
    | PostNotFoundError
    | UserRoleMismatchError
    | InvalidPostAccessError
  > {
    const post = await this.feedRepository.findById(postId);
    if (!post) return new PostNotFoundError();

    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const access = post.permissionToModify(user);
    if (!access) return new Error();

    await this.feedRepository.delete(post.id);
    return "Message deleted";
  }
}
