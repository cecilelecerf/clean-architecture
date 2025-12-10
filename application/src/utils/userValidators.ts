import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserNotActiveError ,UserNotFoundError} from "@application/errors/users";
import { UserEntity } from "@domain/entities/UserEntity";

export async function findActiveUser(
  userRepository: UserRepository,
  userId: UserEntity["id"]
): Promise<UserEntity | UserNotFoundError | UserNotActiveError> {
  const user = await userRepository.findById(userId);
  if (!user) return new UserNotFoundError();
  if (!user.isActive()) return new UserNotActiveError(user.id);
  return user;
}
