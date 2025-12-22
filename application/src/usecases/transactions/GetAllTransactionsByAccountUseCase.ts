import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { TransactionRepository } from "@application/ports/repositories/TransactionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { TransactionEntity } from "@domain/entities/TransactionEntity";
import { IBANInvalidCheckDigitsError, IBANInvalidFormatError, IBANTooLongError, IBANTooShortError } from "@domain/errors/IBAN";
import { IBAN } from "@domain/values/IBAN";

interface Props {
  iban: string;
  userId: string;
}

export class GetAllTransactionsByAccountUsecase {
    public constructor(
        private readonly userRepository: UserRepository,
        private readonly transactionRepository: TransactionRepository,
    ){}

    public async execute({
        iban,
        userId
    }: Props): Promise<
        | TransactionEntity[]
        | UserNotFoundError 
        | UserNotActiveError
        | IBANTooShortError
        | IBANTooLongError 
        | IBANInvalidFormatError 
        | IBANInvalidCheckDigitsError
        | UserRoleMismatchError
    >{
        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) return user;

        const ibanVO = IBAN.create(iban);
        if (ibanVO instanceof Error) return ibanVO;

        if (user.hasRole({ role: "client" }) && user.id === userId) {
            return new UserRoleMismatchError(["client"], user.role);
        }

        return this.transactionRepository.findByIban(ibanVO);
    }
}