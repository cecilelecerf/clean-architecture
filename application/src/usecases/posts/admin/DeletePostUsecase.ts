import { PostNotFoundError,InvalidPostAccessError } from "@application/errors/posts";
 import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
type Props = { userId: PostEntity["advisorId"] } & Pick<PostEntity, "id">;

export class DeletePostUsecase {
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
    if (!access) return new InvalidPostAccessError(user.id, post.id);

    await this.feedRepository.delete(post.id);
    return "Message deleted";
  }
}
