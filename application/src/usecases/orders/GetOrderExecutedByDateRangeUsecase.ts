import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { ActionNotFoundError } from "@application/errors/actions";
import { ClockService } from "@application/ports/services/ClockService";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { OrderToDTO } from "@domain/entities/OrderEntity";
import { ISIN } from "@domain/values/ISIN";
import { InvalidISINError } from "@domain/errors/ISIN";

type Props = {
  isin: string;
  days?: number;
};

export class GetOrderExecutedByDateRangeUsecase {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly orderRepo: OrderRepository,
    private readonly clockService: ClockService
  ) {}

  async execute({
    isin,
    days = 30,
  }: Props): Promise<OrderToDTO[] | ActionNotFoundError | InvalidISINError> {
    const validateIsin = ISIN.isValid(isin);
    if (validateIsin instanceof Error) return validateIsin;
    const action = await this.actionRepository.findByISIN(validateIsin);
    if (!action) return new ActionNotFoundError();

    const now = this.clockService.now();
    const startDate = this.clockService.addDays(now, -days);
    const history = await this.orderRepo.findAllExecutedByISINAndDateRange(
      action.ISIN,
      startDate,
      now
    );
    return history.map((item) => item.toDTO());
  }
}
