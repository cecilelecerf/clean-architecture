import { MySQLClient } from "@adapters/db/MySQLClient";
import { TagRepository } from "@application/ports/repositories/TagRepository";
import { TagEntity } from "@domain/entities/TagEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class TagRepositoryMySQL implements TagRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(tag: TagEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO tags (id, label, color, createdAt, modifiedAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [tag.id, tag.label, tag.color, tag.createdAt, tag.modifiedAt || null]
    );
  }

  async findById(id: TagEntity["id"]): Promise<TagEntity | null> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM tags WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return TagEntity.from(rows[0]);
  }

  async findAll(): Promise<TagEntity[]> {
    const [rows] = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM tags`
    );
    return rows.map((row: any) => TagEntity.from(row));
  }

  async update(tag: TagEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE tags
       SET label = ?, color = ?, modifiedAt = ? 
       WHERE id = ?`,
      [tag.label, tag.color, tag.modifiedAt || new Date(), tag.id]
    );
  }

  async delete(id: TagEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(`DELETE FROM tags WHERE id = ?`, [
      id,
    ]);
  }
}
