import { Document } from "mongoose";

export interface ActionInterface extends Document {
    ISIN: string,
    name: string,
    totalNb: number,
    symbol: string,
    market: string,
    activitySector: string,
    currentPrice: {
        amount: number;
        currency: string;
    },
    isAvailable: boolean,
    createdAt: Date,
    updatedAt: Date 
}