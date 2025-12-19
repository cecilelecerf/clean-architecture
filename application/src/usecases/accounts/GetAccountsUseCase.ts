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

    public async execute(userId: string): Promise<
    | AccountEntity[]
    | null
    | UserNotFoundError 
    | UserNotActiveError
    > {
        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) return user;

        const accounts = await this.accountRepository.findByUserId(userId);

        return accounts;
    }
}