import { PostNotFoundError } from "@application/src/errors/posts/PostNotFoundError";
import { InvalidPostAccessError } from "@application/src/errors/posts/InvalidPostAccessError";
import { TagNotFoundError } from "@application/src/errors/tags/TagNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/src/errors/users/UserRoleMismatchError";
import { PostRepository } from "@application/src/ports/repositories/PostRepository";
import { TagRepository } from "@application/src/ports/repositories/TagRepository";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { findActiveUser } from "@application/src/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
type Props = {
  userId: PostEntity["advisorId"];
} & Pick<PostEntity, "id" | "tagsId">;
export class UpdateTagsInMessageInPostUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly tagRepository: TagRepository
  ) {}
  public async execute({
    userId,
    id: postId,
    tagsId,
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
    if (!access) return new Error();

    post.tagsId = [];
    for (const id of [...new Set(tagsId)]) {
      const tag = await this.tagRepository.findById(id);
      if (!tag) return new TagNotFoundError();
      post.tagsId = [...post.tagsId, tag.id];
    }
    await this.feedRepository.update(post);
    return post;
  }
}
