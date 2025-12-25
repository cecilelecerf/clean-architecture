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
    const post = await this.feedRepository.findById(postId);
    if (!post) return new PostNotFoundError();

    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    const access = post.permissionToModify(user);
    if (!access) return new InvalidPostAccessError(user.id, post.id);

    post.tagsId = [];
    for (const id of Array.from(new Set(tagsId))) {
      const tag = await this.tagRepository.findById(id);
      if (!tag) return new TagNotFoundError();
      post.tagsId = [...post.tagsId, tag.id];
    }
    await this.feedRepository.update(post);
    return post.toDTO();
  }
}
