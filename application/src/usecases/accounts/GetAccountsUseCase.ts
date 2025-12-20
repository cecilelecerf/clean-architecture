import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class GetAccountsUsercase {
    public constructor(
        private readonly accountRepository: AccountRepository,
        private readonly userRepository: UserRepository
    ) {}

    public async execute(userId: string | null): Promise<
    | AccountEntity[]
    | null
    | UserNotFoundError 
    | UserNotActiveError
    > {
        if (userId === null) {
            return this.accountRepository.findByUserId(null);
        }

        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) {
            return user;
        }

        return this.accountRepository.findByUserId(userId);
    }
}