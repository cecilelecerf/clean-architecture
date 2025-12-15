import { ActionRepository } from "@application/ports/repositories/ActionRepository";
import { MongoClient } from "../../MongoClient";
import { ActionEntity } from "@domain/entities/ActionEntity";
import { ActionModel } from "../models/ActionModel";
import { Money } from "@domain/values/Money";

export class ActionRepositoryMongo implements ActionRepository {
    constructor(private readonly client: MongoClient) {}
    
    async save(action: ActionEntity): Promise<void> {
        await this.client.connect();
        
        await ActionModel.create({
            ISIN: action.ISIN,
            name: action.name,
            totalNb: action.totalNb,
            symbol: action.symbol,
            market: action.market,
            activitySector: action.activitySector,
            currentPrice: {
                amount: action.currentPrice.amount,
                currency: action.currentPrice.currency,
            },
            isAvailable: action.isAvailable,
            createdAt: action.createdAt
        });
    }

    async findByISIN(ISIN: ActionEntity["ISIN"]): Promise<ActionEntity | null> {
        await this.client.connect();

        const doc = await ActionModel.findOne({ ISIN: ISIN }).lean();
        if (!doc) return null;

        const currentPrice = Money.create(doc.currentPrice);
        if (currentPrice instanceof Error) throw currentPrice;
        
        return ActionEntity.from({
            ISIN,
            name: doc.name,
            totalNb: doc.totalNb,
            symbol: doc.symbol,
            market: doc.market,
            activitySector: doc.activitySector,
            currentPrice,
            isAvailable: doc.isAvailable,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findAll(): Promise<ActionEntity[]> {
        await this.client.connect();

        const docs = await ActionModel.find().lean();

        return docs.map((doc) => {
            const currentPrice = Money.create(doc.currentPrice);
            if (currentPrice instanceof Error) throw currentPrice;

            return ActionEntity.from({
                ISIN: doc.ISIN,
                name: doc.name,
                totalNb: doc.totalNb,
                symbol: doc.symbol,
                market: doc.market,
                activitySector: doc.activitySector,
                currentPrice,
                isAvailable: doc.isAvailable,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async findAllAvailable(isAvailable: boolean): Promise<ActionEntity[]> {
        await this.client.connect();

        const docs = await ActionModel.find({ isAvailable }).lean();

        return docs.map((doc) => {
            const currentPrice = Money.create(doc.currentPrice);
            if (currentPrice instanceof Error) throw currentPrice;

            return ActionEntity.from({
                ISIN: doc.ISIN,
                name: doc.name,
                totalNb: doc.totalNb,
                symbol: doc.symbol,
                market: doc.market,
                activitySector: doc.activitySector,
                currentPrice,
                isAvailable: doc.isAvailable,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async setAvailability(action: ActionEntity): Promise<void> {
        await this.client.connect();

        await ActionModel.updateOne(
            { _id: action.ISIN },
            { $set: { isAvailable: action.isAvailable } }
        );
    }

    async update(action: ActionEntity): Promise<void> {
        await this.client.connect();
        
        await ActionModel.updateOne(
            { iban: action.ISIN },
            {
                $set: {
                    ISIN: action.ISIN,
                    name: action.name,
                    totalNb: action.totalNb,
                    symbol: action.symbol,
                    market: action.market,
                    activitySector: action.activitySector,
                    currentPrice: {
                        amount: action.currentPrice.amount,
                        currency: action.currentPrice.currency,
                    },
                    isAvailable: action.isAvailable,
                    updatedAt: action.updatedAt || new Date(),
                },
            }
        );
    }

    async delete(ISIN: ActionEntity["ISIN"]): Promise<void> {
        await this.client.connect();
        
        await ActionModel.deleteOne({ ISIN: ISIN });
    }
}