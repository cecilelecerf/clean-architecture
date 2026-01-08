import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { TagDTO, TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ColorInvalidFormatError } from "@domain/errors/color";
import { InvalidTagLabelError } from "@domain/errors/tag";
import { Color } from "@domain/values/Color";

interface CreateTagInput {
  label: string;
  color: string;
  advisorId: UserEntity["id"];
}

export class AddTagUseCase {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService
  ) {}

  async execute({
    label,
    color,
    advisorId,
  }: CreateTagInput): Promise<
    | TagDTO
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | ColorInvalidFormatError
    | InvalidTagLabelError
  > {
    const user = await findActiveUser(this.userRepository, advisorId);
    if (user instanceof Error) return user;
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);

    const colorVo = Color.create(color);
    if (colorVo instanceof ColorInvalidFormatError)
      return new ColorInvalidFormatError(color);

    const tag = TagEntity.create({
      id: this.uuidService.generate(),
      label: label,
      color: colorVo,
      createdAt: this.clockService.now(),
    });

    if (tag instanceof Error) return tag;

    await this.tagRepository.save(tag);
    return tag.toDTO();
  }
}
