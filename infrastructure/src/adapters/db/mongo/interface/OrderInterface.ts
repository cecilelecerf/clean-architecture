export interface OrderInterface {
    userId: string,
    actionId: string,
    type: "buy" | "sell",
    quantity: number,
    price: {
        amount: number;
        currency: string;
    },
    fee: {
        amount: number;
        currency: string;
    },
    date: Date
    status: "pending" | "executed" | "cancelled",
    createdAt: Date,
    updatedAt: Date 
}