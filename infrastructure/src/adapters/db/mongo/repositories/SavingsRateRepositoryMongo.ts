import { SavingRateRepository } from "@application/ports/repositories/SavingRateRepository";
import { MongoClient } from "../../MongoClient";
import { SavingsRateEntity } from "@domain/entities/SavingsRateEntity";
import { SavingsRateModel } from "../models/SavingsRateModel";
import { Percentage } from "@domain/values/Percentage";

export class SavingsRateRepositoryMongo implements SavingRateRepository {
    constructor(private readonly client: MongoClient) {}

    async findCurrent(): Promise<SavingsRateEntity | null> {
        await this.client.connect();

        const doc = await SavingsRateModel
            .findOne()
            .sort({ effectiveDate: -1 })
            .lean();
        
        if (!doc) return null;

        return SavingsRateEntity.from({
            id: doc._id.toString(),
            rate: Percentage.from({ value: doc.rate }),
            effectiveDate: doc.effectiveDate,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt ?? null,
        });
    }

    async findAll(): Promise<SavingsRateEntity[]> {
        await this.client.connect();

        const docs = await SavingsRateModel.find().lean();

        return docs.map((doc) => {
            return SavingsRateEntity.from({
                id: doc._id.toString(),
                rate: Percentage.from({ value: doc.rate }),
                effectiveDate: doc.effectiveDate,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt ?? null,
            });
        })
    }

    async findById(
        id: SavingsRateEntity["id"]
    ): Promise<SavingsRateEntity | null> {
        await this.client.connect();
        
        const doc = await SavingsRateModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        return SavingsRateEntity.from({
            id: doc._id.toString(),
            rate: Percentage.from({ value: doc.rate }),
            effectiveDate: doc.effectiveDate,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt ?? null,
        });
    }

    async save(savingsRate: SavingsRateEntity): Promise<void> {
        await this.client.connect();
                                      
        await SavingsRateModel.create({
                rate: savingsRate.rate.value,
                effectiveDate: savingsRate.effectiveDate,
                createdAt: savingsRate.createdAt
        } as any);
    }

    async update(savingsRate: SavingsRateEntity): Promise<void> {
        await this.client.connect();
                                        
        await SavingsRateModel.updateOne(
            { _id: savingsRate.id },
            {
                $set: {
                    rate: savingsRate.rate,
                    effectiveDate: savingsRate.effectiveDate,
                    updatedAt: savingsRate.updatedAt || new Date(),
                },
            }
        );
    }
}