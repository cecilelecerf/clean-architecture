import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { TagEntity } from "@domain/entities/TagEntity";
import { Color } from "@domain/values/Color";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class TagRepositoryMySQL implements TagRepository {
  constructor(private readonly client: MySQLClient) {}

  private mapRowToTag(row: RowDataPacket): TagEntity {
    const color = Color.from(row.color);

    return TagEntity.from({
      id: row.id,
      label: row.label,
      color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /** Sauvegarder un tag */
  async save(tag: TagEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO tags (id, label, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [tag.id, tag.label, tag.color.getValue(), tag.createdAt, tag.updatedAt]
    );
  }

  /** Trouver un tag par ID */
  async findById(id: TagEntity["id"]): Promise<TagEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM tags WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRowToTag(rows[0]);
  }

  /** Tous les tags */
  async findAll(): Promise<TagEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM tags ORDER BY label ASC`
    );

    return rows.map((row) => this.mapRowToTag(row));
  }

  /** Mettre à jour un tag */
  async update(tag: TagEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE tags SET label = ?, color = ?, updated_at = ? WHERE id = ?`,
      [tag.label, tag.color.getValue(), tag.updatedAt, tag.id]
    );
  }

  /** Supprimer un tag */
  async delete(id: TagEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(`DELETE FROM tags WHERE id = ?`, [
      id,
    ]);
  }
}
