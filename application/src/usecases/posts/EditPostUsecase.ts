import {
  PostNotFoundError,
  InvalidPostAccessError,
} from "@application/errors/posts";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { PostDTO, PostEntity } from "@domain/entities/PostEntity";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import {
  InvalidPostTitleError,
  InvalidPostContentError,
} from "@domain/errors/posts";
import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import { TagEntity } from "@domain/entities/TagEntity";
import { PostDTOMapper, PostWithTagsDTO } from "@application/dto/PostDTOMapper";

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
    | PostWithTagsDTO
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
    let tags: TagEntity[] | undefined;

    if (content !== undefined) {
      const result = post.editContent(content, updatedAt);
      if (result instanceof Error) return result;
    }

    if (title !== undefined) {
      const result = post.editTitle(title, updatedAt);
      if (result instanceof Error) return result;
    }

    if (tagsId !== undefined) {
      const uniqueTagsId = Array.from(new Set(tagsId));

      const validatedTags: TagEntity[] = [];
      for (const tagId of uniqueTagsId) {
        const tag = await this.tagRepository.findById(tagId);
        if (!tag) return new TagNotFoundError();
        validatedTags.push(tag);
      }

      post.tagsId = validatedTags.map((tag) => tag.id);
      tags = validatedTags;
    }

    await this.feedRepository.update(post);

    const postWithTags = Object.assign(post, { tags: tags ?? [] });
    return PostDTOMapper.tagsMap(postWithTags);
  }
}
