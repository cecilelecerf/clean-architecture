import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserNotActiveError } from "@application/src/errors/users/UserNotActiveError";
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
