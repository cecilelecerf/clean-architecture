import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import {
  PostRepository,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export class PostRepositoryMySQL implements PostRepository {
  constructor(private readonly client: MySQLClient) {}

  async save(post: PostEntity): Promise<void> {
    await this.client.query<ResultSetHeader>(
      `INSERT INTO posts (id, advisor_id, title, content, created_at, updated_at, published_at, client_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
      [
        post.id,
        post.advisorId,
        post.title,
        post.content,
        post.createdAt,
        post.updatedAt || null,
        post.publishedAt || null,
        post.clientId || null,
      ]
    );
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
    const readRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM post_user_read WHERE post_id = ?`,
      [id]
    );
    const readsId = readRows.map((r) => r.user_id);
    const tagsId = tagRows.map((r) => r.tag_id);
    return PostEntity.from({
      id: row.id,
      advisorId: row.advisor_id,
      title: row.title,
      content: row.content,
      tagsId,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined,
      publishedAt: row.published_at ?? undefined,
      readBy: readsId,
      clientId: row.client_id ?? undefined,
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

        const readRows = await this.client.query<RowDataPacket[]>(
          `SELECT user_id FROM post_user_read WHERE post_id = ?`,
          [row.id]
        );
        const readsId = readRows.map((r) => r.user_id);
        return PostEntity.from({
          id: row.id,
          advisorId: row.advisor_id,
          title: row.title,
          content: row.content,
          tagsId,
          createdAt: row.created_at,
          updatedAt: row.updated_at ?? undefined,
          publishedAt: row.published_at ?? undefined,
          readBy: readsId,
          clientId: row.client_id ?? undefined,
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

        const readRows = await this.client.query<RowDataPacket[]>(
          `SELECT user_id FROM post_user_read WHERE post_id = ?`,
          [row.id]
        );
        const readsId = readRows.map((r) => r.user_id);
        return PostEntity.from({
          id: row.id,
          advisorId: row.advisor_id,
          title: row.title,
          content: row.content,
          tagsId,
          createdAt: row.created_at,
          updatedAt: row.updated_at ?? undefined,
          publishedAt: row.published_at ?? undefined,
          readBy: readsId,
          clientId: row.client_id ?? undefined,
        });
      })
    );
  }

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

    const existingTagRows = await this.client.query<RowDataPacket[]>(
      `SELECT tag_id FROM post_tag WHERE post_id = ?`,
      [post.id]
    );
    const existingTagIds = existingTagRows.map((r) => r.tag_id);

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

    const existingUserReadRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM post_user_read WHERE post_id = ?`,
      [post.id]
    );
    const existingUserIds = existingUserReadRows.map((r) => r.user_id);

    const UsersToAdd = post.readBy.filter(
      (id) => !existingUserIds.includes(id)
    );
    for (const userId of UsersToAdd) {
      await this.client.query<ResultSetHeader>(
        `INSERT INTO post_user_read (post_id, user_id) VALUES (?, ?)`,
        [post.id, userId]
      );
    }

    const usersToRemove = existingUserIds.filter(
      (id) => !post.readBy.includes(id)
    );
    for (const userId of usersToRemove) {
      await this.client.query<ResultSetHeader>(
        `DELETE FROM post_user_read WHERE post_id = ? AND user_id = ?`,
        [post.id, userId]
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
    const rows = await this.client.query<RowDataPacket[]>(
      `
      SELECT DISTINCT p.*, 
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
      FROM posts p JOIN users u ON u.id = p.advisor_id
      ${tagJoin}
      ${whereSQL}
      ORDER BY p.created_at DESC
        LIMIT ${pagination.limit} OFFSET ${offset}
      `,
      [...params]
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
    const posts = await Promise.all(
      rows.map(async (row) => {
        const tagRows = await this.client.query<RowDataPacket[]>(
          `SELECT t.* FROM post_tag pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = ? `,
          [row.id]
        );

        const readRows = await this.client.query<RowDataPacket[]>(
          `SELECT user_id FROM post_user_read WHERE post_id = ?`,
          [row.id]
        );
        const readsId = readRows.map((r) => r.user_id);
        const tagsId = tagRows.map((r) => r.id);
        const tags = tagRows.map((tagRow) =>
          TagEntity.from({
            id: tagRow.id,
            label: tagRow.label,
            color: tagRow.color,
            createdAt: tagRow.created_at,
            updatedAt: tagRow.updated_at,
          })
        );
        const advisor = UserEntity.from({
          id: row.advisor_id,
          firstname: row.advisor_firstname,
          lastname: row.advisor_lastname,
          email: row.advisor_email,
          passwordHash: row.advisor_password_hash,
          role: row.advisor_role,
          isActiveField: row.advisor_is_active,
          createdAt: row.advisor_created_at,
          confirmedAt: row.advisor_confirmed_at,
          updatedAt: row.advisor_updated_at,
        });
        const post = PostEntity.from({
          id: row.id,
          advisorId: row.advisor_id,
          title: row.title,
          content: row.content,
          tagsId,
          createdAt: row.created_at,
          updatedAt: row.updated_at ?? undefined,
          publishedAt: row.published_at ?? undefined,
          readBy: readsId,
          clientId: row.client_id ?? undefined,
        });
        return Object.assign(post, { tags, advisor });
      })
    );
    return { posts, total: Math.ceil(totalRows[0].total / pagination.limit) };
  }

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
       FROM posts p JOIN users u ON u.id = p.advisor_id WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];

    const tagRows = await this.client.query<RowDataPacket[]>(
      `SELECT t.* FROM post_tag pt JOIN tags t ON t.id = pt.tag_id WHERE pt.post_id = ? `,
      [row.id]
    );
    const readRows = await this.client.query<RowDataPacket[]>(
      `SELECT user_id FROM post_user_read WHERE post_id = ?`,
      [id]
    );
    const readsId = readRows.map((r) => r.user_id);
    const tagsId = tagRows.map((r) => r.id);
    const tags = tagRows.map((tagRow) =>
      TagEntity.from({
        id: tagRow.id,
        label: tagRow.label,
        color: tagRow.color,
        createdAt: tagRow.created_at,
        updatedAt: tagRow.updated_at,
      })
    );
    const advisor = UserEntity.from({
      id: row.advisor_id,
      firstname: row.advisor_firstname,
      lastname: row.advisor_lastname,
      email: row.advisor_email,
      passwordHash: row.advisor_password_hash,
      role: row.advisor_role,
      isActiveField: row.advisor_is_active,
      createdAt: row.advisor_created_at,
      confirmedAt: row.advisor_confirmed_at,
      updatedAt: row.advisor_updated_at,
    });
    const post = PostEntity.from({
      id: row.id,
      advisorId: row.advisor_id,
      title: row.title,
      content: row.content,
      tagsId,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? undefined,
      publishedAt: row.published_at ?? undefined,
      readBy: readsId,
      clientId: row.client_id ?? undefined,
    });
    return Object.assign(post, { tags, advisor });
  }

  async findAllUnreadWithTags(
    userId: UserEntity["id"]
  ): Promise<PostWithTagsAndUser[]> {
    // ✅ UNE SEULE requête avec tous les JOINs
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
      
      -- Advisor
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
      
      -- Tags (peut être NULL si pas de tags)
      t.id AS tag_id,
      t.label AS tag_label,
      t.color AS tag_color,
      t.created_at AS tag_created_at,
      t.updated_at AS tag_updated_at,
      
      -- ReadBy (agrégé en JSON)
      GROUP_CONCAT(DISTINCT pr_all.user_id) AS read_by_ids
      
    FROM posts p
    
    -- Join avec l'advisor (obligatoire)
    INNER JOIN users u ON u.id = p.advisor_id
    
    -- Join pour filtrer les posts NON LUS par cet utilisateur
    LEFT JOIN post_user_read pr ON pr.post_id = p.id AND pr.user_id = ?
    
    -- Join pour récupérer TOUS les utilisateurs qui ont lu (pour le champ readBy)
    LEFT JOIN post_user_read pr_all ON pr_all.post_id = p.id
    
    -- Join avec les tags (optionnel)
    LEFT JOIN post_tag pt ON pt.post_id = p.id
    LEFT JOIN tags t ON t.id = pt.tag_id
    
    WHERE pr.user_id IS NULL 
      AND p.published_at IS NOT NULL
      AND (p.client_id IS NULL OR p.client_id = ?)
      
    GROUP BY p.id, t.id
    ORDER BY p.published_at DESC`,
      [userId, userId]
    );

    // ✅ Grouper les résultats par post (car un post peut avoir plusieurs tags)
    const postsMap = new Map<string, PostWithTagsAndUser>();

    for (const row of rows) {
      const postId = row.post_id;

      if (!postsMap.has(postId)) {
        // Créer l'advisor (une seule fois par post)
        const advisor = UserEntity.from({
          id: row.advisor_id,
          firstname: row.advisor_firstname,
          lastname: row.advisor_lastname,
          email: row.advisor_email,
          passwordHash: row.advisor_password_hash,
          role: row.advisor_role,
          isActiveField: row.advisor_is_active,
          createdAt: row.advisor_created_at,
          confirmedAt: row.advisor_confirmed_at,
          updatedAt: row.advisor_updated_at,
        });

        // Parser les IDs des utilisateurs qui ont lu
        const readByIds = row.read_by_ids
          ? row.read_by_ids.split(",").filter(Boolean)
          : [];

        // Créer le post
        const post = PostEntity.from({
          id: postId,
          advisorId: row.advisor_id,
          title: row.title,
          content: row.content,
          tagsId: [], // On va remplir ça après
          createdAt: row.post_created_at,
          updatedAt: row.post_updated_at ?? undefined,
          publishedAt: row.published_at ?? undefined,
          readBy: readByIds,
          clientId: row.client_id ?? undefined,
        });

        // Combiner post + advisor + tags vides pour l'instant
        postsMap.set(
          postId,
          Object.assign(post, {
            advisor,
            tags: [] as TagEntity[],
          })
        );
      }

      // Ajouter le tag s'il existe
      if (row.tag_id) {
        const tag = TagEntity.from({
          id: row.tag_id,
          label: row.tag_label,
          color: row.tag_color,
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
