import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { MongoClient } from "../../MongoClient";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { FormuleCreditModel } from "../models/FormuleCreditModel";
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
      type: formule.type.value, // aligné avec MySQL
      label: formule.label,
      description: formule.description,
      isActive: formule.isActive,
      accountId: formule.accountId.value,
      minAmount: formule.minAmount
        ? {
            amount: formule.minAmount.amount,
            currency: formule.minAmount.currency,
          }
        : null,
      maxAmount: formule.maxAmount
        ? {
            amount: formule.maxAmount.amount,
            currency: formule.maxAmount.currency,
          }
        : null,
      currency: formule.currency ?? null,
      createdAt: formule.createdAt,
      updatedAt: formule.updatedAt,
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
          type: formule.type.value, // aligné avec MySQL
          label: formule.label,
          description: formule.description,
          isActive: formule.isActive,
          accountId: formule.accountId.value,
          minAmount: formule.minAmount
            ? {
                amount: formule.minAmount.amount,
                currency: formule.minAmount.currency,
              }
            : null,
          maxAmount: formule.maxAmount
            ? {
                amount: formule.maxAmount.amount,
                currency: formule.maxAmount.currency,
              }
            : null,
          currency: formule.currency ?? null,
          updatedAt: formule.updatedAt,
        },
      }
    );
  }

  /** Trouver une formule d'un crédit par ID */
  async findById(
    id: FormuleCreditEntity["id"]
  ): Promise<FormuleCreditEntity | null> {
    await this.client.connect();

    const doc = await FormuleCreditModel.findById(id).lean();
    if (!doc) return null;

    return FormuleMapper.mapDocToFormule(doc);
  }

  /** Toutes les formules */
  async findAll(): Promise<FormuleCreditEntity[]> {
    await this.client.connect();

    const docs = await FormuleCreditModel.find()
      .sort({ createdAt: -1 }) // aligné avec MySQL (ordre descendant)
      .lean();

    return docs.map(FormuleMapper.mapDocToFormule);
  }

  /** Toutes les formules actives */
  async findAllActive(): Promise<FormuleCreditEntity[]> {
    await this.client.connect();

    const docs = await FormuleCreditModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map(FormuleMapper.mapDocToFormule);
  }

  /** Vérifier si une formule existe avec le même label */
  async existsByLabel(label: string): Promise<boolean> {
    await this.client.connect();

    const doc = await FormuleCreditModel.findOne({ label }).lean();
    return !!doc;
  }

  /** Récupérer tous les types distincts */
  async getDistinctTypes(): Promise<string[]> {
    await this.client.connect();

    const types = await FormuleCreditModel.distinct("type");
    return types ?? [];
  }
}
