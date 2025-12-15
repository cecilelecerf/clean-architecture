import { PostNotFoundError } from "@application/errors/posts";
import { UserNotActiveError ,UserNotFoundError} from "@application/errors/users";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";

type Props = { userId: string; postId: string };

export class MarkPostAsReadUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    userId,
    postId,
  }: Props): Promise<
    PostEntity | PostNotFoundError | UserNotFoundError | UserNotActiveError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const post = await this.feedRepository.findById(postId);
    if (!post) return new PostNotFoundError();
    post.markAsRead(userId);
    await this.feedRepository.update(post);

    return post;
  }
}
