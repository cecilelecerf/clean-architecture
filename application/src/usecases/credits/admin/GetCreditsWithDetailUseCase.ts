import { CreditDTOMapper, CreditDTOWithFormuleAndAccount } from "@application/dto/CreditDTOMapper";
import { CreditNotFoundError } from "@application/errors/credits";
import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  advisorId: UserEntity["id"];
  creditId: CreditEntity["id"]
};

export class GetCreditsWithDetailsUseCase {
    constructor(
        private readonly creditRepository: CreditRepository,
        private readonly userRepository: UserRepository,
    ) {}

    public async execute({
        advisorId,
        creditId
    }: Props): Promise<
        CreditDTOWithFormuleAndAccount | UserNotFoundError | UserNotActiveError | UserRoleMismatchError | CreditNotFoundError
    > {
        const advisor = await findActiveUser(this.userRepository, advisorId);
        if (advisor instanceof Error) return advisor;

        if (!advisor.hasRole({ role: "conseiller" }))
        return new UserRoleMismatchError(["conseiller"], advisor.role);

        const credit = await this.creditRepository.findByIdWithDetails(creditId);
        if(!credit) return new CreditNotFoundError();

        return CreditDTOMapper.map(credit);
    }
}