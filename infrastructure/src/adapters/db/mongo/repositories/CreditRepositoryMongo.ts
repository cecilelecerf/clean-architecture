import { CreditRepository } from "@application/ports/repositories/CreditRepository";
import { CreditEntity } from "@domain/entities/CreditEntity";
import { CreditModel } from "../models/CreditModel";
import { Money } from "@domain/values/Money";
import { Percentage } from "@domain/values/Percentage";
import { MongoClient } from "../../MongoClient";
import { UserEntity } from "@domain/entities/UserEntity";

export class CreditRepositoryMongo implements CreditRepository {
    constructor(private readonly client: MongoClient) {}

    async findById(id: CreditEntity["id"]): Promise<CreditEntity | null> {
        await this.client.connect();
        
        const doc = await CreditModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        const initialAmount = Money.create(doc.initialAmount);
        if (initialAmount instanceof Error) throw initialAmount;

        const monthlyPayment = Money.create(doc.monthlyPayment);
        if (monthlyPayment instanceof Error) throw monthlyPayment;

        const remainingBalance = Money.create(doc.remainingBalance);
        if (remainingBalance instanceof Error) throw remainingBalance;

        const interestRate = Percentage.create(doc.interestRate);
        if (interestRate instanceof Error) throw interestRate;

        const insuranceRate = Percentage.create(doc.insuranceRate);
        if (insuranceRate instanceof Error) throw insuranceRate;

        return CreditEntity.from({
            id,
            userId: doc.userId,
            initialAmount,
            interestRate,
            insuranceRate,
            durationMonths: doc.durationMonths,
            startDate: doc.startDate,
            monthlyPayment,
            remainingBalance,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    async findAllByUserId(userId: UserEntity["id"]): Promise<CreditEntity[]> {
        await this.client.connect();
        
        const docs = await CreditModel.find({ userId }).lean();
        
        return docs.map((doc) => {
            const initialAmount = Money.create(doc.initialAmount);
            if (initialAmount instanceof Error) throw initialAmount;

            const monthlyPayment = Money.create(doc.monthlyPayment);
            if (monthlyPayment instanceof Error) throw monthlyPayment;

            const remainingBalance = Money.create(doc.remainingBalance);
            if (remainingBalance instanceof Error) throw remainingBalance;

            const interestRate = Percentage.create(doc.interestRate);
            if (interestRate instanceof Error) throw interestRate;

            const insuranceRate = Percentage.create(doc.insuranceRate);
            if (insuranceRate instanceof Error) throw insuranceRate;
        
            return CreditEntity.from({
                id: doc._id.toString(),
                userId: doc.userId,
                initialAmount,
                interestRate,
                insuranceRate,
                durationMonths: doc.durationMonths,
                startDate: doc.startDate,
                monthlyPayment,
                remainingBalance,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async findActiveCredits(): Promise<CreditEntity[]> {
        await this.client.connect();

        const docs = await CreditModel
            .find({ "remainingBalance.amount": { $gt: 0 } })
            .lean();

        return docs.map((doc) => {
            const initialAmount = Money.create(doc.initialAmount);
            if (initialAmount instanceof Error) throw initialAmount;

            const monthlyPayment = Money.create(doc.monthlyPayment);
            if (monthlyPayment instanceof Error) throw monthlyPayment;

            const remainingBalance = Money.create(doc.remainingBalance);
            if (remainingBalance instanceof Error) throw remainingBalance;

            const interestRate = Percentage.create(doc.interestRate);
            if (interestRate instanceof Error) throw interestRate;

            const insuranceRate = Percentage.create(doc.insuranceRate);
            if (insuranceRate instanceof Error) throw insuranceRate;
        
            return CreditEntity.from({
                id: doc._id.toString(),
                userId: doc.userId,
                initialAmount,
                interestRate,
                insuranceRate,
                durationMonths: doc.durationMonths,
                startDate: doc.startDate,
                monthlyPayment,
                remainingBalance,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
        })
    }

    async save(credit: CreditEntity): Promise<void> {
        await this.client.connect();
                
        await CreditModel.create({
            userId: credit.userId,
            initialAmount: {
                amount: credit.initialAmount.amount,
                currency: credit.initialAmount.currency,
            },
            interestRate: credit.interestRate.value,
            insuranceRate: credit.insuranceRate.value,
            durationMonths: credit.durationMonths,
            startDate: credit.startDate,
            monthlyPayment: {
                amount: credit.monthlyPayment.amount,
                currency: credit.monthlyPayment.currency,
            },
            remainingBalance: {
                amount: credit.remainingBalance.amount,
                currency: credit.remainingBalance.currency,
            },
            createdAt: credit.createdAt
        } as any);
    }

    async update(credit: CreditEntity): Promise<void> {
        await this.client.connect();
                
        await CreditModel.updateOne(
            { _id: credit.id },
            {
                $set: {
                    userId: credit.userId,
                    initialAmount: {
                        amount: credit.initialAmount.amount,
                        currency: credit.initialAmount.currency,
                    },
                    interestRate: credit.interestRate,
                    insuranceRate: credit.insuranceRate,
                    durationMonths: credit.durationMonths,
                    startDate: credit.startDate,
                    monthlyPayment: {
                        amount: credit.monthlyPayment.amount,
                        currency: credit.monthlyPayment.currency,
                    },
                    remainingBalance: {
                        amount: credit.remainingBalance.amount,
                        currency: credit.remainingBalance.currency,
                    },
                    updatedAt: credit.updatedAt || new Date(),
                },
            }
        );
    }

    async delete(id: CreditEntity["id"]): Promise<void> {
        await this.client.connect();
                
        await CreditModel.deleteOne({ _id: id });
    }
}