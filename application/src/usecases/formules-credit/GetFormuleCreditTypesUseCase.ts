import { FormuleTypeDto } from "@application/dto/FormuleTypeDTOMapper";
import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";
import { FormuleType } from "@domain/values/FormuleType";

type Props = {
  userId: UserEntity["id"];
};

export class GetFormuleCreditTypesUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  public async execute({ userId }: Props): Promise<
    | FormuleTypeDto[]
    | UserNotFoundError
    | UserNotActiveError
    | {
        value: string;
        label: string;
      }[]
  > {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;
    return FormuleType.getValidTypesWithLabels();
  }
}
