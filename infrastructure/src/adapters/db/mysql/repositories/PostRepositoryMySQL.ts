import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  PostRepository,
  PostWithTags,
} from "@application/ports/repositories/PostRepository";
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

  async findAllPaginatedWithTagsByFilters(
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      tagsId?: string[];
      name?: string;
      published?: boolean;
    },
    pagination: { page: number; limit: number }
  ): Promise<{ posts: PostWithTags[]; total: number }> {
    const whereClauses: string[] = [];
    const params: any[] = [];

    if (filters.dateFrom) {
      whereClauses.push("p.created_at >= ?");
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      whereClauses.push("p.created_at <= ?");
      params.push(filters.dateTo);
    }

    let tagJoin = "";
    if (filters.tagsId?.length) {
      tagJoin = "INNER JOIN post_tag pt ON p.id = pt.post_id";
      whereClauses.push(
        `pt.tag_id IN (${filters.tagsId.map(() => "?").join(",")})`
      );
      params.push(...filters.tagsId);
    }

    if (filters.name) {
      whereClauses.push("p.title LIKE ?");
      params.push(`%${filters.name}%`);
    }

    if (typeof filters.published === "boolean") {
      if (filters.published) {
        whereClauses.push("p.published_at IS NOT NULL");
      } else {
        whereClauses.push("p.published_at IS NULL");
      }
    }

    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";

    const offset = (pagination.page - 1) * pagination.limit;

    const rows = await this.client.query<RowDataPacket[]>(
      `
      SELECT DISTINCT p.*
      FROM posts p
      ${tagJoin}
      ${whereSQL}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pagination.limit, offset]
    );

    const totalRows = await this.client.query<RowDataPacket[]>(
      `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      ${tagJoin}
      ${whereSQL}
      `,
      params
    );
    const total = totalRows[0]?.total || 0;

    const posts = await Promise.all(
      rows.map(async (row) => {
        const tagRows = await this.client.query<RowDataPacket[]>(
          `SELECT t.* FROM post_tag pt JOIN tags t WHERE t.id = pt.id WHERE pt.post_id = ? `,
          [row.id]
        );
        const tagsId = tagRows.map((r) => r.id);
        const tags = tagRows.map((tagRow) =>
          TagEntity.from({
            id: tagRow.id,
            label: tagRow.label,
            color: tagRow.color,
            createdAt: tagRow.created_at,
            modifiedAt: tagRow.modified_at,
          })
        );
        const post = PostEntity.from({
          id: row.id,
          advisorId: row.advisor_id,
          title: row.title,
          content: row.content,
          tagsId,
          createdAt: row.created_at,
          modifiedAt: row.modified_at ?? undefined,
          publishedAt: row.published_at ?? undefined,
          readBy: [],
        });
        return Object.assign(post, { tags });
      })
    );

    return { posts, total };
  }

  async findWithTagsById(id: PostEntity["id"]): Promise<PostWithTags | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];

    const tagRows = await this.client.query<RowDataPacket[]>(
      `SELECT t.* FROM post_tag pt JOIN tags t WHERE t.id = pt.id WHERE pt.post_id = ? `,
      [row.id]
    );
    const tagsId = tagRows.map((r) => r.id);
    const tags = tagRows.map((tagRow) =>
      TagEntity.from({
        id: tagRow.id,
        label: tagRow.label,
        color: tagRow.color,
        createdAt: tagRow.created_at,
        modifiedAt: tagRow.modified_at,
      })
    );
    const post = PostEntity.from({
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
    return Object.assign(post, { tags });
  }
}
