import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { MongoClient } from "../../MongoClient";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { Percentage } from "@domain/values/Percentage";
import { FormuleCreditModel } from "../models/FormuleCreditModel";
import { Money } from "@domain/values/Money";
import { FormuleMapper } from "../../mappers/FormuleMapper";

export class FormuleCreditRepositoryMongo implements FormuleCreditRepository {
    constructor(private readonly client: MongoClient) {}

    /** Sauvegarder une formule d'un crédit */
    async save(formule: FormuleCreditEntity): Promise<void> {
        await this.client.connect();

        await FormuleCreditModel.create({
            _id: formule.id,
            interestRate: formule.interestRate.value,
            insuranceRate: formule.insuranceRate.value,
            type: formule.type,
            label: formule.label,
            description: formule.description,
            isActive: formule.isActive,
            accountId: formule.accountId,
            minAmount: {
                amount: formule.minAmount?.amount,
                currency: formule.minAmount?.currency,
            },
            maxAmount: {
                amount: formule.maxAmount?.amount,
                currency: formule.maxAmount?.currency,
            },
            currency: formule.currency,
            updatedAt: formule.updatedAt
        });
    }

    /** Mettre à jour une formule d'un crédit */
    async update(formule: FormuleCreditEntity): Promise<void> {
        await this.client.connect();
        
        await FormuleCreditModel.updateOne(
            { _id: formule.id },
            {
                $set: {
                    interestRate: formule.interestRate.value,
                    insuranceRate: formule.insuranceRate.value,
                    type: formule.type,
                    label: formule.label,
                    description: formule.description,
                    isActive: formule.isActive,
                    accountId: formule.accountId,
                    minAmount: {
                        amount: formule.minAmount?.amount,
                        currency: formule.minAmount?.currency,
                    },
                    maxAmount: {
                        amount: formule.maxAmount?.amount,
                        currency: formule.maxAmount?.currency,
                    },
                    currency: formule.currency,
                    updatedAt: formule.updatedAt
                },
            }
        );
    }

    /** Trouver une formule d'un crédit par ID */
    async findById(id: FormuleCreditEntity["id"]): Promise<FormuleCreditEntity | null> {
        await this.client.connect();
        
        const doc = await FormuleCreditModel.findById(id).lean();
        if (!doc) return null;
        
        return FormuleMapper.mapDocToFormule(doc);
    }

    /** Toutes les formules */
    async findAll(): Promise<FormuleCreditEntity[]>{
        await this.client.connect();

        const docs = await FormuleCreditModel.find()
        .sort({ startDate: -1 })
        .lean();
        
        return docs.map((doc) => FormuleMapper.mapDocToFormule(doc));
    }

    /** Toutes les formules d'un crédit active */
    async findAllActive(): Promise<FormuleCreditEntity[]> {
        await this.client.connect();
        
        const docs = await FormuleCreditModel.find({
            "isActive": { $gt: 1 },
        })
        .sort({ startDate: -1 })
        .lean();
        
        return docs.map((doc) => FormuleMapper.mapDocToFormule(doc));
    }

    /** Savoir s'il existe une formule avec le label */
    async existsByLabel(label: string): Promise<boolean> {
        await this.client.connect();
        
        const docs = await FormuleCreditModel.find({ label })
            .sort({ startDate: -1 })
            .lean();
        
        return docs.length > 0;
    }

    /** Récupérer tous les types existants en base */
    async getDistinctTypes(): Promise<string[]> {
        await this.client.connect();

        const docs = await FormuleCreditModel.distinct("type").exec();

        return docs ?? [];
    }
}