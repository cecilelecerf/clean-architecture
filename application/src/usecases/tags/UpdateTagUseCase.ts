import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { TagDTO, TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { ColorInvalidFormatError } from "@domain/errors/color";
import { Color } from "@domain/values/Color";

interface Props {
  id: TagEntity["id"];
  label?: string;
  color?: string;
  administratorId: UserEntity["id"];
}

export class UpdateTagUseCase {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({
    label,
    color,
    administratorId,
    id,
  }: Props): Promise<
    | TagDTO
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | TagNotFoundError
    | ColorInvalidFormatError
  > {
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);

    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      return new TagNotFoundError();
    }
    let colorVo;
    if (color) {
      colorVo = Color.from(color);
      if (colorVo instanceof ColorInvalidFormatError)
        return new ColorInvalidFormatError(color);
    }
    const now = this.clockService.now();
    if (label) tag.rename({ newLabel: label, now });
    if (colorVo) tag.changeColor({ newColor: colorVo, now });

    await this.tagRepository.update(tag);
    return tag.toDTO();
  }
}
