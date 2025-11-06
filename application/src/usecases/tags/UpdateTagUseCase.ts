import { TagNotFoundError } from "@application/errors/tags/TagNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";

interface Props {
  id: TagEntity["id"];
  label?: string;
  color?: TagEntity["color"];
  administratorId: UserEntity["id"];
}

export class UpdateTagUseCase {
  constructor(
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute({
    label,
    color,
    administratorId,
    id,
  }: Props): Promise<
    | TagEntity
    | UserRoleMismatchError
    | UserNotFoundError
    | UserNotActiveError
    | TagNotFoundError
  > {
    const user = await findActiveUser(this.userRepository, administratorId);
    if (user instanceof Error) return user;
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["conseiller", "directeur"], user.role);

    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      return new TagNotFoundError();
    }

    if (label) tag.rename(label);
    if (color) tag.changeColor(color);

    await this.tagRepository.update(tag);
    return tag;
  }
}
