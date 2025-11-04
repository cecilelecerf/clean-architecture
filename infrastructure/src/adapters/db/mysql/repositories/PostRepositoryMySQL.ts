import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { PostRepository } from "@application/ports/repositories/PostRepository";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class PostRepositoryMySQL implements PostRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(post: PostEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO posts (id, advisor_id, title, content, created_at, modified_at, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        post.id,
        post.advisorId,
        post.title,
        post.content,
        post.createdAt,
        post.modifiedAt || null,
        post.publishedAt || null,
      ]
    );

    for (const tagId of post.tagsId) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO post_tag (post_id, tag_id) VALUES (?, ?)`,
        [post.id, tagId]
      );
    }
  }

  async findById(id: PostEntity["id"]): Promise<PostEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];

    const tagRows = await this.client.query<RowDataPacket[]>(
      `SELECT tag_id FROM post_tag WHERE post_id = ?`,
      [id]
    );

    const tagsId = tagRows.map((r) => r.tagId);

    return PostEntity.from({
      id: row.id,
      advisorId: row.advisorId,
      title: row.title,
      content: row.content,
      tagsId,
      createdAt: row.createdAt,
      modifiedAt: row.modifiedAt ?? undefined,
      publishedAt: row.publishedAt ?? undefined,
      // TODO : à remplir si tu veux gérer la lecture par utilisateurs
      readBy: [],
    });
  }

  async findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<PostEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts WHERE advisor_id = ?`,
      [advisorId]
    );

    return Promise.all(
      rows.map(async (row) => {
        const tagRows = await this.client.query<RowDataPacket[]>(
          `SELECT tag_id FROM post_tag WHERE post_id = ?`,
          [row.id]
        );
        const tagsId = tagRows.map((r) => r.tagId);

        return PostEntity.from({
          id: row.id,
          advisorId: row.advisorId,
          title: row.title,
          content: row.content,
          tagsId,
          createdAt: row.createdAt,
          modifiedAt: row.modifiedAt ?? undefined,
          publishedAt: row.publishedAt ?? undefined,
          readBy: [],
        });
      })
    );
  }

  async findAllRecent(limit = 10): Promise<PostEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    return Promise.all(
      rows.map(async (row) => {
        const tagRows = await this.client.query<RowDataPacket[]>(
          `SELECT tag_id FROM post_tag WHERE post_id = ?`,
          [row.id]
        );
        const tagsId = tagRows.map((r) => r.tagId);

        return PostEntity.from({
          id: row.id,
          advisorId: row.advisorId,
          title: row.title,
          content: row.content,
          tagsId,
          createdAt: row.createdAt,
          modifiedAt: row.modifiedAt ?? undefined,
          publishedAt: row.publishedAt ?? undefined,
          readBy: [],
        });
      })
    );
  }

  async update(post: PostEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE posts
       SET title = ?, content = ?, modified_at = ?, published_at = ?
       WHERE id = ?`,
      [
        post.title,
        post.content,
        post.modifiedAt || new Date(),
        post.publishedAt || null,
        post.id,
      ]
    );

    const existingTagRows = await this.client.query<RowDataPacket[]>(
      `SELECT tag_id FROM post_tag WHERE post_id = ?`,
      [post.id]
    );
    const existingTagIds = existingTagRows.map((r) => r.tagId);

    const tagsToAdd = post.tagsId.filter((id) => !existingTagIds.includes(id));
    for (const tagId of tagsToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO post_tag (post_id, tag_id) VALUES (?, ?)`,
        [post.id, tagId]
      );
    }

    const tagsToRemove = existingTagIds.filter(
      (id) => !post.tagsId.includes(id)
    );
    for (const tagId of tagsToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM post_tag WHERE post_id = ? AND tag_id = ?`,
        [post.id, tagId]
      );
    }
  }

  async delete(id: PostEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(`DELETE FROM posts WHERE id = ?`, [
      id,
    ]);
  }

  async findAllByTags(tagId: TagEntity["id"]): Promise<PostEntity[]> {
    const tagRows = await this.client.query<RowDataPacket[]>(
      `SELECT post_id FROM post_tag WHERE tag_id = ?`,
      [tagId]
    );

    const posts: PostEntity[] = [];
    for (const row of tagRows) {
      const post = await this.findById(row.postId);
      if (post) posts.push(post);
    }
    return posts;
  }
}
