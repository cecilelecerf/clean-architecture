import { FormuleTypeDto } from "@application/dto/FormuleTypeDTOMapper";
import { FormuleCreditNotFoundError } from "@application/errors/formules-credit";
import { UserNotActiveError, UserNotFoundError } from "@application/errors/users";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { findActiveUser } from "@application/utils/userValidators";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  userId: UserEntity["id"]
};

export class GetFormuleCreditTypesUseCase {
    constructor(
        private readonly formuleRepository: FormuleCreditRepository,
        private readonly userRepository: UserRepository,
    ){}

    public async execute({
        userId
    }: Props): Promise <
        | FormuleTypeDto[]
        | UserNotFoundError 
        | UserNotActiveError
        | FormuleCreditNotFoundError
    >{
        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) return user;
    
        const types = await this.formuleRepository.getDistinctTypes();

        return types.map(type => ({ type }));
    }
}
