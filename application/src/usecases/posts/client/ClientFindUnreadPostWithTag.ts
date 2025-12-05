import { findActiveUser } from "@application/utils/userValidators";
import { PostRepository, PostWithTagsAndUser } from "../../../ports/repositories/PostRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserNotActiveError } from "@application/errors/users/UserNotActiveError";

type Props = {
    clientId: UserEntity["id"];
};

export class ClientFindUnreadPostWithTag {
    constructor(
        private postRepository: PostRepository,
        private readonly userRepository: UserRepository
    ) { }

    public async execute({
        clientId,
    }: Props): Promise<
        | PostWithTagsAndUser[]
        | UserNotFoundError
        | UserNotActiveError
        | UserRoleMismatchError
    > {
        const user = await findActiveUser(this.userRepository, clientId);
        if (user instanceof Error) return user;
        if (!user.hasRole({ role: "client" }))
            return new UserRoleMismatchError(["client"], user.role);

        const posts = await this.postRepository.findAllUnreadWithTags(clientId);
        return posts;
    }
}
