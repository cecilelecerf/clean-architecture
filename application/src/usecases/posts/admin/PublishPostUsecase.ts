import { PostNotFoundError,InvalidPostAccessError } from "@application/errors/posts";
 import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
type Props = { userId: PostEntity["advisorId"] } & Pick<PostEntity, "id">;
export class PublishPostUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    userId,
    id: postId,
  }: Props): Promise<
    | PostEntity
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

    post.published(this.clockService.now());
    await this.feedRepository.update(post);
    return post;
  }
}
