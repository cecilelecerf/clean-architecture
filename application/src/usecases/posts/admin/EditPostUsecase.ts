import { PostNotFoundError } from "@application/errors/posts/PostNotFoundError";
import { InvalidPostAccessError } from "@application/errors/posts/InvalidPostAccessError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { PostEntity } from "@domain/entities/PostEntity";
import { UpdateTagsPostUsecase } from "./UpdateTagsPostUsecase";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { InvalidPostTitleError } from "@domain/errors/posts/InvalidPostTitleError";
import { InvalidPostContentError } from "@domain/errors/posts/InvalidPostContentError";
import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
type Props = {
  userId: PostEntity["advisorId"];
  id: PostEntity["id"];
} & Partial<Pick<PostEntity, "content" | "title" | "tagsId">>;
export class EditPostUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly tagRepository: TagRepository,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    userId,
    title,
    content,
    tagsId,
    id: postId,
  }: Props): Promise<
    | PostEntity
    | UserNotFoundError
    | UserNotActiveError
    | PostNotFoundError
    | UserRoleMismatchError
    | InvalidPostAccessError
    | InvalidPostTitleError
    | InvalidPostContentError
    | TagNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const post = await this.feedRepository.findById(postId);
    if (!post) return new PostNotFoundError();

    const access = post.permissionToModify(user);
    if (!access) return new InvalidPostAccessError(user.id, post.id);

    const updatedAt = this.clockService.now();

    if (content) {
      const result = post.editContent(content, updatedAt);
      if (result instanceof Error) return result;
    }

    if (title) {
      const result = post.editTitle(title, updatedAt);
      if (result instanceof Error) return result;
    }

    if (tagsId) {
      const updateTagsUsecase = new UpdateTagsPostUsecase(
        this.feedRepository,
        this.userRepository,
        this.tagRepository
      );
      const tagResult = await updateTagsUsecase.execute({
        userId: user.id,
        id: post.id,
        tagsId,
      });
      if (tagResult instanceof Error) return tagResult;
    }

    await this.feedRepository.update(post);
    return post;
  }
}
