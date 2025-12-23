import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { AccountDTO, AccountEntity } from "@domain/entities/AccountEntity";

type Props = { 
    userId: string; 
    type: AccountEntity['type'] 
};

export class GetAllAccountsByTypeUserCase {
    public constructor(
        private readonly accountRepository: AccountRepository,
        private readonly userRepository: UserRepository
    ) {}

    public async execute({
        userId,
        type,
    }: Props): Promise<
        | AccountDTO[]
        | UserRoleMismatchError
        | UserNotFoundError
        | UserNotActiveError
    >{
        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) {
            return user;
        }

        const accounts = await this.accountRepository.findByType(type);
        console.log(accounts);
        return accounts.map((account) => account.toDTO());
    }
}