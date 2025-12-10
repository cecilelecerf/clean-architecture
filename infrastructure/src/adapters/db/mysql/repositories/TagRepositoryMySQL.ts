import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { TagEntity } from "@domain/entities/TagEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class TagRepositoryMySQL implements TagRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(tag: TagEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO tags (id, label, color, created_at, modified_at) 
        VALUES (?, ?, ?, ?, ?)`,
      [tag.id, tag.label, tag.color.toString(), tag.createdAt, tag.modifiedAt || null]
    );
  }

  async findById(id: TagEntity["id"]): Promise<TagEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM tags WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return TagEntity.from({
      id: row.id,
      label: row.label,
      color: row.color,
      createdAt: row.createdAt,
      modifiedAt: row.modifiedAt,
    });
  }

  async findAll(): Promise<TagEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(`SELECT * FROM tags`);
    return rows.map((row) =>
      TagEntity.from({
        id: row.id,
        label: row.label,
        color: row.color,
        createdAt: row.createdAt,
        modifiedAt: row.modifiedAt,
      })
    );
  }

  async update(tag: TagEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE tags
       SET label = ?, color = ?, modified_at = ? 
       WHERE id = ?`,
      [tag.label, tag.color.toString(), tag.modifiedAt || new Date(), tag.id]
    );
  }

  async delete(id: TagEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(`DELETE FROM tags WHERE id = ?`, [
      id,
    ]);
  }
}
