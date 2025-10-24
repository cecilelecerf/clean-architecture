import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";
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
