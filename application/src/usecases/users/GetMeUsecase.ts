import {
  UserNotActiveError,
  UserNotFoundError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  userId: UserEntity["id"];
};

export class GetMeUsecase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    userId,
  }: Props): Promise<UserEntity | UserNotFoundError | UserNotActiveError> {
    const user = await findActiveUser(this.userRepository, userId);
    return user;
  }
}
