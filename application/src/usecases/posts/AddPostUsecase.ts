import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { PostDTO, PostEntity } from "@domain/entities/PostEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import {
  InvalidPostContentError,
  InvalidPostTitleError,
} from "@domain/errors/posts";
type Props = { tagsId: TagEntity["id"][]; published?: boolean } & Pick<
  PostEntity,
  "content" | "title" | "advisorId"
>;

export class AddPostUsecase {
  constructor(
    private readonly feedRepository: PostRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
  ) {}
  public async execute({
    advisorId,
    title,
    content,
    tagsId,
    published,
  }: Props): Promise<
    | PostDTO
    | UserNotFoundError
    | UserNotActiveError
    | InvalidPostContentError
    | InvalidPostTitleError
    | UserRoleMismatchError
    | TagNotFoundError
  > {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (advisor.hasRole({ role: "client" }))
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        advisor.role,
      );

    const tags = [];
    for (const id of Array.from(new Set(tagsId))) {
      const tag = await this.tagRepository.findById(id);
      if (!tag) return new TagNotFoundError();
      tags.push(tag);
    }

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const post = PostEntity.create({
      id,
      createdAt,
      advisorId: advisor.id,
      content,
      title,
      tagsId: tags.map((tag) => tag.id),
      publishedAt: published ? createdAt : undefined,
    });
    if (post instanceof Error) return post;
    await this.feedRepository.save(post);
    return post.toDTO();
  }
}

/*
Règle applicative :
  - L'user existe
  - L'user est bien de rôle conseiller ou directeur
  - Le tag existe
  - Supprimer les doublons d'id de tag

  Règle métier : 
  - Le content est de la bonne longueur
  - Le title est de la bonne longueur
*/
