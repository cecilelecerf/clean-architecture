export interface TransactionInterface {
    label: string,
    icon: string,
    fromAccountId: string,
    toAccountId: string,
    amount: {
        amount: number;
        currency: string;
    },
    date: Date,
    type: "credit" | "debit" 
}