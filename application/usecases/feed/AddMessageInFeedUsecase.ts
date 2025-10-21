import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { FeedRepository } from "@application/ports/repositories/FeedRepository";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { FeedItemEntity } from "@domain/entities/FeedItemEntity";
import { TagEntity } from "@domain/entities/TagEntity";
type Props = { tagsId: TagEntity["id"][]; published?: boolean } & Pick<
  FeedItemEntity,
  "content" | "title" | "advisorId"
>;
export class AddMessageInFeedUsecase {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}
  public async execute({
    advisorId,
    title,
    content,
    tagsId,
    published,
  }: Props) {
    const advisor = await findActiveUser(this.userRepository, advisorId);
    if (advisor instanceof Error) return advisor;

    if (advisor.hasRole({ role: "client" }))
      return new UserRoleMismatchError(
        ["conseiller", "directeur"],
        advisor.role
      );

    const tags = [];
    for (const id of [...new Set(tagsId)]) {
      const tag = await this.tagRepository.findById(id);
      if (!tag) return new TagNotFoundError();
      tags.push(tag);
    }

    const id = this.uuidService.generate();
    const createdAt = this.clockService.now();

    const feedItem = FeedItemEntity.create({
      id,
      createdAt,
      advisorId: advisor.id,
      content,
      title,
      tagsId: tags.map((tag) => tag.id),
      publishedAt: published ? createdAt : undefined,
    });
    if (feedItem instanceof Error) return feedItem;
    await this.feedRepository.save(feedItem);
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
