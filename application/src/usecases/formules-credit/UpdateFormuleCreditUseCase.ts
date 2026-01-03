import { AccountNotFoundError } from "@application/errors/accounts";
import { FormuleCreditAlreadyExistsError, FormuleCreditNotFoundError, NegativeInterestRateError } from "@application/errors/formules-credit";
import { UserNotActiveError, UserNotFoundError, UserRoleMismatchError } from "@application/errors/users";
import { AccountRepository } from "@application/ports/repositories/AccountRepository";
import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { findActiveUser } from "@application/utils/userValidators";
import { FormuleCreditDTO, FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { IBANInvalidCheckDigitsError, IBANInvalidFormatError, IBANTooLongError, IBANTooShortError } from "@domain/errors/IBAN";
import { MoneyAmountInvalidError, MoneyAmountNegativeError, MoneyCurrencyMissingError } from "@domain/errors/money";
import { InvalidPercentageError } from "@domain/errors/percentage";
import { IBAN } from "@domain/values/IBAN";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";

type Props = {
    userId: UserEntity["id"];
    id: FormuleCreditEntity["id"];
    interestRate?: number;
    insuranceRate?: number;
    label?: string;
    type?: string;
    description?: string;
    isActive?: boolean;
    accountId?: string;
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
}

export class UpdateFormuleCreditUseCase {
    constructor(
        private readonly formuleRepository: FormuleCreditRepository,
        private readonly userRepository: UserRepository,
        private readonly accountRepository: AccountRepository,
        private readonly clockService: ClockService
    ){}

    public async execute({
        userId,
        id,
        interestRate,
        insuranceRate,
        label,
        type,
        description,
        isActive,
        accountId,
        minAmount,
        maxAmount,
        currency
    }: Props): Promise<
        | FormuleCreditDTO
        | UserNotFoundError 
        | UserNotActiveError
        | UserRoleMismatchError
        | FormuleCreditNotFoundError
        | FormuleCreditAlreadyExistsError
        | NegativeInterestRateError
        | InvalidPercentageError
        | MoneyCurrencyMissingError 
        | MoneyAmountInvalidError 
        | MoneyAmountNegativeError
        | IBANTooShortError 
        | IBANTooLongError 
        | IBANInvalidFormatError 
        | IBANInvalidCheckDigitsError
        | AccountNotFoundError
    >{
        const user = await findActiveUser(this.userRepository, userId);
        if (user instanceof Error) return user;
        if (!user.hasRole({ role: "directeur" }))
            return new UserRoleMismatchError(["directeur"], user.role);

        const formuleCredit = await this.formuleRepository.findById(id);
        if (!formuleCredit) return new FormuleCreditNotFoundError();

        if(label && label !== formuleCredit.label){
            const exists = await this.formuleRepository.existsByLabel(label);
            if (exists) return new FormuleCreditAlreadyExistsError(label);
        }

        let interestRateVO: Percentage | undefined;

        if (interestRate !== undefined) {
            if (interestRate < 0) return new NegativeInterestRateError();

            const vo = Percentage.create(interestRate);
            if (vo instanceof Error) return vo;

            interestRateVO = vo;
        }

        let insuranceRateVO: Percentage | undefined;

        if (insuranceRate !== undefined) {
            if (insuranceRate < 0) return new NegativeInterestRateError();

            const vo = Percentage.create(insuranceRate);
            if (vo instanceof Error) return vo;

            insuranceRateVO = vo;
        }

        if(accountId){
            const iban = IBAN.create(accountId);
            if (iban instanceof Error) return iban;
            const account = this.accountRepository.findByIBAN(iban)
            if(!account) return new AccountNotFoundError;
        }

        let minAmountVO: Money | undefined;
        let maxAmountVO: Money | undefined;
        
        if (minAmount !== undefined && currency) {
            const tmp = Money.create({ amount: minAmount, currency });
            if (tmp instanceof Error) return tmp;
            minAmountVO = tmp;
        }
        
        if (maxAmount !== undefined && currency) {
            const tmp = Money.create({ amount: maxAmount, currency });
            if (tmp instanceof Error) return tmp;
            maxAmountVO = tmp;
        }

        formuleCredit.update({
            interestRate: interestRateVO,
            insuranceRate: insuranceRateVO,
            type: type,
            isActive: isActive,
            label: label,
            description: description,
            accountId: accountId,
            minAmount: minAmountVO,
            maxAmount: maxAmountVO,
            currency: currency,
            now: this.clockService.now(),
        });

        await this.formuleRepository.update(formuleCredit);

        return formuleCredit.toDTO();
    }
}