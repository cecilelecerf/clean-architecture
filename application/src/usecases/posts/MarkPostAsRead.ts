import { PostNotFoundError } from "@application/src/errors/posts/PostNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { PostRepository } from "@application/src/ports/repositories/PostRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { findActiveUser } from "@application/src/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";

type Props = { userId: string; postId: string };

export class MarkPostAsRead {
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
