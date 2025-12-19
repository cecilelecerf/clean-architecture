import { findActiveUser } from "@application/utils/userValidators";
import { PostRepository } from "../../ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from "@application/errors/users";
import {
  PostToFrontMapper,
  PostWithTagsAndUsersToFront,
} from "@application/toFronts/PostToFrontMapper";

type Props = {
  clientId: UserEntity["id"];
};

export class GetUnreadPostWithTagUsecase {
  constructor(
    private postRepository: PostRepository,
    private readonly userRepository: UserRepository
  ) {}

  public async execute({
    clientId,
  }: Props): Promise<
    | PostWithTagsAndUsersToFront[]
    | UserNotFoundError
    | UserNotActiveError
    | UserRoleMismatchError
  > {
    const user = await findActiveUser(this.userRepository, clientId);
    if (user instanceof Error) return user;
    if (!user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["client"], user.role);

    const posts = await this.postRepository.findAllUnreadWithTags(clientId);
    return PostToFrontMapper.maps(posts);
  }
}
