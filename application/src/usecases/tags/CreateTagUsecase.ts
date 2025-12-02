import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { UuidService } from "@application/ports/services/UuidService";
import { findActiveUser } from "@application/utils/userValidators";
import { TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ColorInvalidFormatError } from "@domain/errors/color/ColorInvalidFormatError";
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
    | TagEntity
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
    | ColorInvalidFormatError
  > {
    const user = await findActiveUser(this.userRepository, advisorId);
    if (user instanceof Error) return user;
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);

    const colorVo = Color.from(color);
    if (colorVo instanceof Error) return colorVo;

    const tag = TagEntity.from({
      id: this.uuidService.generate(),
      label: label,
      color: colorVo,
      createdAt: this.clockService.now(),
    });

    await this.tagRepository.save(tag);
    return tag;
  }
}
