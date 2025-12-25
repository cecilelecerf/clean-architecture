import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  PostRepository,
  PostWithTags,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Email } from "@domain/values/Email";
import { Color } from "@domain/values/Color";
import { UserMapper } from "../../mappers/UserMapper";

export class PostRepositoryMySQL implements PostRepository {
  constructor(private readonly client: MySQLClient) {}

  // 🔧 Méthode helper pour mapper un row SQL vers PostEntity simple
  private mapRowToPost(
    row: RowDataPacket,
    tagsId: string[],
    readsId: string[]
  ): PostEntity {
    return PostEntity.from({
      id: row.id,
      advisorId: row.advisor_id,
      title: row.title,
      content: row.content,
      tagsId,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at ?? undefined,
      readBy: readsId,
      clientId: row.client_id ?? undefined,
    });
  }

  // 🔧 Méthode helper pour récupérer les tags d'un post
  private async getPostTags(
    postId: string
  ): Promise<{ tags: TagEntity[]; tagsId: string[] }> {
    const tagRows = await this.client.query<RowDataPacket[]>(
      `SELECT t.* FROM post_tag pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = ?`,
      [postId]
    );

    const tags = tagRows.map((tagRow) =>
      TagEntity.from({
        id: tagRow.id,
        label: tagRow.label,
        color: Color.from(tagRow.color),
        createdAt: tagRow.created_at,
        updatedAt: tagRow.updated_at,
      })
    );

    const tagsId = tagRows.map((r) => r.id);

    return { tags, tagsId };
  }

  // 🔧 Méthode helper pour récupérer les user IDs qui ont lu un post
  private async getPostReaders(postId: string): Promise<string[]> {
    const readRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM post_user_read WHERE post_id = ?`,
      [postId]
    );
    return readRows.map((r) => r.user_id);
  }

  // 🔧 Méthode helper pour mettre à jour les relations many-to-many
  private async updateManyToMany(
    postId: string,
    newIds: string[],
    tableName: string,
    columnName: string
  ): Promise<void> {
    // Récupérer les IDs existants
    const existingRows = await this.client.query<RowDataPacket[]>(
      `SELECT ${columnName} FROM ${tableName} WHERE post_id = ?`,
      [postId]
    );
    const existingIds = existingRows.map((r) => r[columnName]);

    // Ajouter les nouveaux
    const idsToAdd = newIds.filter((id) => !existingIds.includes(id));
    for (const id of idsToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO ${tableName} (post_id, ${columnName}) VALUES (?, ?)`,
        [postId, id]
      );
    }

    // Supprimer les anciens
    const idsToRemove = existingIds.filter((id) => !newIds.includes(id));
    for (const id of idsToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM ${tableName} WHERE post_id = ? AND ${columnName} = ?`,
        [postId, id]
      );
    }
  }

  /** 📬 Sauvegarder un post */
  async save(post: PostEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO posts (id, advisor_id, title, content, created_at, updated_at, published_at, client_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.id,
        post.advisorId,
        post.title,
        post.content,
        post.createdAt,
        post.updatedAt,
        post.publishedAt || null,
        post.clientId || null,
      ]
    );

    // Sauvegarder les relations
    for (const readId of post.readBy) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO post_user_read (post_id, user_id) VALUES (?, ?)`,
        [post.id, readId]
      );
    }
    for (const tagId of post.tagsId) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO post_tag (post_id, tag_id) VALUES (?, ?)`,
        [post.id, tagId]
      );
    }
  }

  /** 🔍 Trouver un post par ID */
  async findById(id: PostEntity["id"]): Promise<PostEntity | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return null;

    const { tagsId } = await this.getPostTags(id);
    const readsId = await this.getPostReaders(id);

    return this.mapRowToPost(rows[0], tagsId, readsId);
  }

  /** 🔍 Post avec tags par post ID */
  async findByIdWithTags(id: PostEntity["id"]): Promise<PostWithTags | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const { tags, tagsId } = await this.getPostTags(id);
    const readsId = await this.getPostReaders(id);

    const post = this.mapRowToPost(row, tagsId, readsId);

    return Object.assign(post, { tags });
  }

  /** 🔍 Tous les posts d'un advisor */
  async findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<PostEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts WHERE advisor_id = ? ORDER BY created_at DESC`,
      [advisorId]
    );

    return Promise.all(
      rows.map(async (row) => {
        const { tagsId } = await this.getPostTags(row.id);
        const readsId = await this.getPostReaders(row.id);
        return this.mapRowToPost(row, tagsId, readsId);
      })
    );
  }

  /** 🔍 Posts récents */
  async findAllRecent(limit = 10): Promise<PostEntity[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT * FROM posts ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    return Promise.all(
      rows.map(async (row) => {
        const { tagsId } = await this.getPostTags(row.id);
        const readsId = await this.getPostReaders(row.id);
        return this.mapRowToPost(row, tagsId, readsId);
      })
    );
  }

  /** 🔄 Mettre à jour un post */
  async update(post: PostEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `UPDATE posts
       SET title = ?, content = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
      [
        post.title,
        post.content,
        post.updatedAt || new Date(),
        post.publishedAt || null,
        post.id,
      ]
    );

    // Mettre à jour les tags
    await this.updateManyToMany(post.id, post.tagsId, "post_tag", "tag_id");

    // Mettre à jour les lecteurs
    await this.updateManyToMany(
      post.id,
      post.readBy,
      "post_user_read",
      "user_id"
    );
  }

  /** ❌ Supprimer un post */
  async delete(id: PostEntity["id"]): Promise<void> {
    await this.client.query<ResultSetHeader>(`DELETE FROM posts WHERE id = ?`, [
      id,
    ]);
  }

  /** 🔍 Posts par tag */
  async findAllByTags(tagId: TagEntity["id"]): Promise<PostEntity[]> {
    const tagRows = await this.client.query<RowDataPacket[]>(
      `SELECT post_id FROM post_tag WHERE tag_id = ?`,
      [tagId]
    );

    const posts = await Promise.all(
      tagRows.map((row) => this.findById(row.post_id))
    );

    return posts.filter((post): post is PostEntity => post !== null);
  }

  /** 🔍 Post avec tags et user par ID */
  async findWithTagsAndUserById(
    id: PostEntity["id"]
  ): Promise<PostWithTagsAndUser | null> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        p.*,
        u.id AS advisor_id,
        u.firstname AS advisor_firstname,
        u.lastname AS advisor_lastname,
        u.email AS advisor_email,
        u.password_hash AS advisor_password_hash,
        u.role AS advisor_role,
        u.is_active AS advisor_is_active,
        u.created_at AS advisor_created_at,
        u.confirmed_at AS advisor_confirmed_at,
        u.updated_at AS advisor_updated_at
       FROM posts p 
       JOIN users u ON u.id = p.advisor_id 
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const { tags, tagsId } = await this.getPostTags(id);
    const readsId = await this.getPostReaders(id);
    const advisor = UserMapper.mapRowToUser(row, "advisor_");
    const post = this.mapRowToPost(row, tagsId, readsId);

    return Object.assign(post, { tags, advisor });
  }

  /** 🔍 Posts paginés avec filtres */
  async findAllPaginatedWithTagsAndUserByFilters(
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
      tagsId?: string[];
      title?: string;
      status?: boolean;
    },
    pagination: { page: number; limit: number }
  ): Promise<{ posts: PostWithTagsAndUser[]; total: number }> {
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

    if (filters.title) {
      whereClauses.push("p.title LIKE ?");
      params.push(`%${filters.title}%`);
    }

    if (typeof filters.status === "boolean") {
      if (filters.status) {
        whereClauses.push("p.published_at IS NOT NULL");
      } else {
        whereClauses.push("p.published_at IS NULL");
      }
    }

    const whereSQL = whereClauses.length
      ? "WHERE " + whereClauses.join(" AND ")
      : "";
    const offset = (pagination.page - 1) * pagination.limit;

    // Query pour les posts
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT DISTINCT p.*, 
        u.id AS advisor_id,
        u.firstname AS advisor_firstname,
        u.lastname AS advisor_lastname,
        u.email AS advisor_email,
        u.password_hash AS advisor_password_hash,
        u.role AS advisor_role,
        u.is_active AS advisor_is_active,
        u.created_at AS advisor_created_at,
        u.confirmed_at AS advisor_confirmed_at,
        u.updated_at AS advisor_updated_at
      FROM posts p 
      JOIN users u ON u.id = p.advisor_id
      ${tagJoin}
      ${whereSQL}
      ORDER BY p.created_at DESC
      LIMIT ${pagination.limit} OFFSET ${offset}`,
      params
    );

    // Query pour le total
    const totalRows = await this.client.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      ${tagJoin}
      ${whereSQL}`,
      params
    );

    // Mapper les posts avec tags et advisor
    const posts = await Promise.all(
      rows.map(async (row) => {
        const { tags, tagsId } = await this.getPostTags(row.id);
        const readsId = await this.getPostReaders(row.id);
        const advisor = UserMapper.mapRowToUser(row, "advisor_");
        const post = this.mapRowToPost(row, tagsId, readsId);

        return Object.assign(post, { tags, advisor });
      })
    );

    return {
      posts,
      total: Math.ceil(totalRows[0].total / pagination.limit),
    };
  }

  /** 🔍 Posts non lus avec tags */
  async findAllUnreadWithTags(
    userId: UserEntity["id"]
  ): Promise<PostWithTagsAndUser[]> {
    const rows = await this.client.query<RowDataPacket[]>(
      `SELECT 
        p.id AS post_id,
        p.advisor_id,
        p.title,
        p.content,
        p.created_at AS post_created_at,
        p.updated_at AS post_updated_at,
        p.published_at,
        p.client_id,
        
        u.id AS advisor_id,
        u.firstname AS advisor_firstname,
        u.lastname AS advisor_lastname,
        u.email AS advisor_email,
        u.password_hash AS advisor_password_hash,
        u.role AS advisor_role,
        u.is_active AS advisor_is_active,
        u.created_at AS advisor_created_at,
        u.confirmed_at AS advisor_confirmed_at,
        u.updated_at AS advisor_updated_at,
        
        t.id AS tag_id,
        t.label AS tag_label,
        t.color AS tag_color,
        t.created_at AS tag_created_at,
        t.updated_at AS tag_updated_at,
        
        GROUP_CONCAT(DISTINCT pr_all.user_id) AS read_by_ids
        
      FROM posts p
      INNER JOIN users u ON u.id = p.advisor_id
      LEFT JOIN post_user_read pr ON pr.post_id = p.id AND pr.user_id = ?
      LEFT JOIN post_user_read pr_all ON pr_all.post_id = p.id
      LEFT JOIN post_tag pt ON pt.post_id = p.id
      LEFT JOIN tags t ON t.id = pt.tag_id
      
      WHERE pr.user_id IS NULL 
        AND p.published_at IS NOT NULL
        AND (p.client_id IS NULL OR p.client_id = ?)
        
      GROUP BY p.id, t.id
      ORDER BY p.published_at DESC`,
      [userId, userId]
    );

    // Grouper par post
    const postsMap = new Map<string, PostWithTagsAndUser>();

    for (const row of rows) {
      const postId = row.post_id;

      if (!postsMap.has(postId)) {
        const advisor = UserMapper.mapRowToUser(row, "advisor_");
        const readByIds = row.read_by_ids
          ? row.read_by_ids.split(",").filter(Boolean)
          : [];

        const post = PostEntity.from({
          id: postId,
          advisorId: row.advisor_id,
          title: row.title,
          content: row.content,
          tagsId: [],
          createdAt: row.post_created_at,
          updatedAt: row.post_updated_at ?? undefined,
          publishedAt: row.published_at ?? undefined,
          readBy: readByIds,
          clientId: row.client_id ?? undefined,
        });

        postsMap.set(
          postId,
          Object.assign(post, {
            advisor,
            tags: [] as TagEntity[],
          })
        );
      }

      if (row.tag_id) {
        const tag = TagEntity.from({
          id: row.tag_id,
          label: row.tag_label,
          color: Color.from(row.tag_color),
          createdAt: row.tag_created_at,
          updatedAt: row.tag_updated_at,
        });

        const postWithData = postsMap.get(postId)!;
        postWithData.tags.push(tag);
        postWithData.tagsId.push(row.tag_id);
      }
    }

    return Array.from(postsMap.values());
  }
}
