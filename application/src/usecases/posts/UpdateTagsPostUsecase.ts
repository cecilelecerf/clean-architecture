import {
  PostNotFoundError,
  InvalidPostAccessError,
} from "@application/errors/posts";
import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { PostDTO, PostEntity } from "@domain/entities/PostEntity";
import { TagEntity } from "@domain/entities/TagEntity";

type Props = {
  userId: PostEntity["advisorId"];
} & Pick<PostEntity, "id" | "tagsId">;

export class UpdateTagsPostUsecase {
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
    | PostDTO
    | UserNotFoundError
    | UserNotActiveError
    | PostNotFoundError
    | UserRoleMismatchError
    | InvalidPostAccessError
    | TagNotFoundError
  > {
    // Validation utilisateur
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    // Récupération du post
    const post = await this.feedRepository.findById(postId);
    if (!post) return new PostNotFoundError();

    // Vérification des permissions
    const access = post.permissionToModify(user);
    if (!access) return new InvalidPostAccessError(user.id, post.id);

    // Dédoublonnage des tags
    const uniqueTagsId = Array.from(new Set(tagsId));

    const tags: TagEntity[] = [];
    for (const tagId of uniqueTagsId) {
      const tag = await this.tagRepository.findById(tagId);
      if (!tag) return new TagNotFoundError();
      tags.push(tag);
    }

    post.tagsId = tags.map((tag) => tag.id);

    await this.feedRepository.update(post);

    const postWithTags = Object.assign(post, { tags });
    return postWithTags.toDTO();
  }
}
