import {
  PostNotFoundError,
  InvalidPostAccessError,
} from "@application/errors/posts";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import {
  PostRepository,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import {
  PostDTOMapper,
  PostWithTagsAndUsersDTO,
} from "@application/dto/PostDTOMapper";
import { findActiveUser } from "@application/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
type Props = {
  userId: PostEntity["advisorId"];
  id: PostEntity["id"];
};
export class FindPostByIdWithTagsUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}
  public async execute({
    userId,
    id: postId,
  }: Props): Promise<
    | PostWithTagsAndUsersDTO
    | UserNotFoundError
    | UserNotActiveError
    | PostNotFoundError
    | InvalidPostAccessError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const post = await this.feedRepository.findWithTagsAndUserById(postId);
    if (!post) return new PostNotFoundError();

    if (user.hasRole({ role: "client" }) && !post.publishedAt)
      return new InvalidPostAccessError(user.id, post.id);

    return PostDTOMapper.map(post);
  }
}
