import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { UserRepository } from "@application/ports/repositories/UserRepository";
 import { findActiveUser } from "@application/utils/userValidators";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { MoneyAmountInvalidError, MoneyAmountNegativeError,MoneyCurrencyMissingError } from "@domain/errors/money";
import { Money } from "@domain/values/Money";

interface Props {
  userId: string;
  ISIN: string;
  name: string;
  totalNb: number;
  symbol: string;
  market: string;
  activitySector: string;
  priceAmount: number;
  priceCurrency: string;
  isAvailable: boolean;
}

export class CreateActionUsecase {
  public constructor(
    private readonly actionRepository: ActionRepository,
    private readonly userRepository: UserRepository
) {}

  // Création des actions que pour les user ayant le rôle de directeur
  public async execute({
    userId,
    ISIN,
    name,
    totalNb,
    symbol,
    market,
    activitySector,
    priceAmount,
    priceCurrency,
    isAvailable,
  }: Props): Promise<
     | UserRoleMismatchError
     | MoneyCurrencyMissingError
     | MoneyAmountInvalidError
     | MoneyAmountNegativeError
     | UserNotFoundError 
     | UserNotActiveError
     | void> {
    const user = await findActiveUser(this.userRepository, userId);
    if (user instanceof Error) return user;

    // TODO : attention il y a le rôle conseiller aussi pour le if tu peux faire un si il n'a pas le rôle directeur
    if (user.hasRole({ role: "client" }))
      return new UserRoleMismatchError(["directeur"], user.role);

    const price = Money.create({
      amount: priceAmount,
      currency: priceCurrency
    });

    if (price instanceof Error) return price;

    const action = ActionEntity.from({
      ISIN,
      name,
      totalNb,
      symbol,
      market,
      activitySector,
      currentPrice: price,
      isAvailable,
      // TODO: utiliser le service
      createdAt: new Date(),
      updatedAt: undefined
    });

    await this.actionRepository.save(action);
  }
}