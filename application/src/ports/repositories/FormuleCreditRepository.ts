import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";

export interface FormuleCreditRepository {
    save(formule: FormuleCreditEntity): Promise<void>;
    update(formule: FormuleCreditEntity): Promise<void>;
    findById(id: string): Promise<FormuleCreditEntity | null>;
    findAll(): Promise<FormuleCreditEntity[]>;
    findAllActive(): Promise<FormuleCreditEntity[]>;
    existsByLabel(label: string): Promise<boolean>;
    getDistinctTypes(): Promise<string[]>;
}