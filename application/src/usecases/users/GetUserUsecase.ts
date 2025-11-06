import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  userId: UserEntity["id"];
};

export class GetUserUsecase {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute({
    userId,
  }: Props): Promise<UserEntity | UserNotFoundError | UserNotActiveError> {
    const user = await findActiveUser(this.userRepository, userId);
    return user;
  }
}
