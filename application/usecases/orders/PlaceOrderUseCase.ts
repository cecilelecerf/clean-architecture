import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { OrderRepository } from "@application/ports/repositories/OrderRepository";
import { FeeService } from "@application/ports/services/FeeService";
import { OrderEntity } from "@domain/entities/OrderEntity";

// TODO: Revoir la gestion des erreurs
export class PlaceOrderUsecase{
    public constructor(
        private readonly orderRepository: OrderRepository,
        private readonly actionRepository: ActionRepository,
        private readonly feeService: FeeService
    ){}

    public async execute(userId: string, actionId: string, type: "buy" | "sell", quantity: number)
    {
        const action = await this.actionRepository.findByISIN(actionId);
        if (!action) return new Error(`Action ${actionId} introuvable`);

        const totalPriceResult = action.currentPrice.multiply(quantity);
        if (totalPriceResult instanceof Error) return totalPriceResult;
        const totalPrice = totalPriceResult;

        const feeResult = await this.feeService.calculateFee(totalPrice);
        if (feeResult instanceof Error) return feeResult;
        const fee = feeResult;

        const order = OrderEntity.from({
            id: crypto.randomUUID(),
            userId,
            actionId: action.ISIN,
            type,
            quantity,
            price: totalPrice,
            fee,
            date: new Date(),
            status: "pending"
        });

        await this.orderRepository.saveOrder(order);
    }
}