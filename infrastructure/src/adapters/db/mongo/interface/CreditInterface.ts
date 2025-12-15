export interface CreditInterface {
    userId: string,
    initialAmount: {
        amount: number;
        currency: string;
    },
    interestRate: number,
    insuranceRate: number,
    durationMonths: number,
    startDate: Date,
    monthlyPayment: {
        amount: number;
        currency: string;
    },
    remainingBalance: {
        amount: number;
        currency: string;
    },
    createdAt: Date,
    updatedAt: Date 
}