import { FormuleCreditRepository } from "@application/ports/repositories/FormuleCreditRepository";
import { MySQLClient } from "../../MySQLClient";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { FormuleCreditEntity } from "@domain/entities/FormuleCreditEntity";
import { FormuleMapper } from "../../mappers/FormuleMapper";

export class FormuleCreditRepositoryMySQL implements FormuleCreditRepository {
  constructor(private readonly client: MySQLClient) {}

  /** Sauvegarder une formule d'un crédit */
  async save(formule: FormuleCreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO formules
            (id, interest_rate, insurance_rate, type, label, description, is_active, account_id, created_at, min_amount, max_amount, currency, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formule.id,
        formule.interestRate.value,
        formule.insuranceRate.value,
        formule.type,
        formule.label,
        formule.description,
        formule.isActive,
        formule.accountId.value,
        formule.createdAt,
        formule.minAmount ? formule.minAmount.amount : null,
        formule.maxAmount ? formule.maxAmount.amount : null,
        formule.currency ?? null,
        formule.updatedAt,
      ]
    );
  }

  /** Mettre à jour une formule d'un crédit */
  async update(formule: FormuleCreditEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE formules
           SET interest_rate = ?, insurance_rate = ?, type = ?, label = ?, description = ?, is_active = ?, account_id = ?, min_amount = ?, max_amount = ?, currency = ?, updated_at = ?
           WHERE id = ?`,
      [
        formule.interestRate.value,
        formule.insuranceRate.value,
        formule.type,
        formule.label,
        formule.description,
        formule.isActive,
        formule.accountId,
        formule.minAmount?.amount,
        formule.maxAmount?.amount,
        formule.currency,
        formule.updatedAt,
        formule.id,
      ]
    );
  }

  /** Trouver une formule d'un crédit par ID */
  async findById(
    id: FormuleCreditEntity["id"]
  ): Promise<FormuleCreditEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM formules WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    return FormuleMapper.mapRowToFormule(rows[0]);
  }

  /** Toutes les formules */
  async findAll(): Promise<FormuleCreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM formules"
    );

    return rows.map((row) => FormuleMapper.mapRowToFormule(row));
  }

  /** Toutes les formules d'un crédit active */
  async findAllActive(): Promise<FormuleCreditEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      "SELECT * FROM formules WHERE is_active = 1"
    );

    return rows.map((row) => FormuleMapper.mapRowToFormule(row));
  }

  /** Savoir s'il existe une formule avec le label */
  async existsByLabel(label: string): Promise<boolean> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      "SELECT 1 FROM formules WHERE label = ? LIMIT 1",
      [label]
    );

    return Array.isArray(rows) && rows.length > 0;
  }

  /** Récupérer tous les types existants en base */
  async getDistinctTypes(): Promise<string[]> {
    const rows = await this.client.queryRows<any>(
      "SELECT DISTINCT type AS type FROM formules"
    );

    return rows.map((r: { type: string }) => r.type);
  }
}
