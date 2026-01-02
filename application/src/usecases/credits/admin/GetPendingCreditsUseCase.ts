import { CreditDTOMapper } from "@application/dto/CreditDTOMapper";
import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  advisorId: UserEntity["id"];
};

export class GetPendingCreditsUseCase{
    constructor(
        private readonly creditRepository: CreditRepository,
        private readonly userRepository: UserRepository,
    ) {}

    public async execute({
        advisorId,
    }: Props): Promise<
        CreditDTOMapper[] | UserNotFoundError | UserNotActiveError | UserRoleMismatchError
    > {
        const advisor = await findActiveUser(this.userRepository, advisorId);
        if (advisor instanceof Error) return advisor;

        if (!advisor.hasRole({ role: "conseiller" }))
        return new UserRoleMismatchError(["conseiller"], advisor.role);

        const credits = await this.creditRepository.findPendingCredits();

        return credits.map((credit) => CreditDTOMapper.mapWthFormule(credit));
    }
}