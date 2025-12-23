import {
  PostRepository,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { MongoClient } from "../../MongoClient";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { PostModel } from "../models/PostModel";
import { Color } from "@domain/values/Color";
import { ColorInvalidFormatError } from "@domain/errors/color";
import { UserMapper } from "../../mappers/UserMapper";

export class PostRepositoryMongo implements PostRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToPost(doc: any): PostEntity {
    return PostEntity.from({
      id: doc._id,
      advisorId: doc.advisorId?.toString() || doc.advisorId,
      title: doc.title,
      content: doc.content,
      tagsId: doc.tagsId || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt ?? null,
      publishedAt: doc.publishedAt ?? null,
      readBy: doc.readBy || [],
      clientId: doc.clientId ?? null,
    });
  }

  private mapDocToTag(doc: any): TagEntity | undefined {
    const color = Color.from(doc.color);
    if (color instanceof ColorInvalidFormatError) {
      return;
    }

    return TagEntity.from({
      id: doc._id.toString(),
      label: doc.label,
      color,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private combinePostWithTagsAndUser(
    doc: any,
    advisor: UserEntity,
    tags: TagEntity[]
  ): PostWithTagsAndUser {
    const post = this.mapDocToPost(doc);
    return Object.assign(post, { advisor, tags });
  }

  /** 📬 Sauvegarder un post */
  async save(post: PostEntity): Promise<void> {
    await this.client.connect();

    await PostModel.create({
      _id: post.id,
      advisorId: post.advisorId,
      title: post.title,
      content: post.content,
      tagsId: post.tagsId,
      createdAt: post.createdAt,
      readBy: post.readBy,
      updatedAt: post.updatedAt ?? null,
      publishedAt: post.publishedAt,
      clientId: post.clientId,
    });
  }

  /** 🔍 Trouver un post par ID */
  async findById(id: PostEntity["id"]): Promise<PostEntity | null> {
    await this.client.connect();

    const doc = await PostModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToPost(doc);
  }

  /** 🔍 Tous les posts d'un advisor */
  async findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<PostEntity[]> {
    await this.client.connect();

    const docs = await PostModel.find({ advisorId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToPost(doc));
  }

  /** 🔍 Posts récents */
  async findAllRecent(limit: number = 10): Promise<PostEntity[]> {
    await this.client.connect();

    const docs = await PostModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map((doc) => this.mapDocToPost(doc));
  }

  /** 🔄 Mettre à jour un post */
  async update(post: PostEntity): Promise<void> {
    await this.client.connect();

    await PostModel.findByIdAndUpdate(
      post.id,
      {
        $set: {
          title: post.title,
          content: post.content,
          updatedAt: post.updatedAt || new Date(),
          publishedAt: post.publishedAt || null,
          tagsId: post.tagsId,
          readBy: post.readBy,
        },
      },
      { new: true }
    );
  }

  /** ❌ Supprimer un post */
  async delete(id: PostEntity["id"]): Promise<void> {
    await this.client.connect();

    await PostModel.deleteOne({ _id: id });
  }

  /** 🔍 Posts par tag */
  async findAllByTags(tagId: TagEntity["id"]): Promise<PostEntity[]> {
    await this.client.connect();

    const docs = await PostModel.find({ tagsId: tagId })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => this.mapDocToPost(doc));
  }

  /** 🔍 Post avec tags et user par ID (refactorisé avec populate) */
  async findWithTagsAndUserById(
    id: PostEntity["id"]
  ): Promise<PostWithTagsAndUser | null> {
    await this.client.connect();

    const doc = await PostModel.findById(id)
      .populate({
        path: "advisorId",
      })
      .populate({
        path: "tagsId",
      })
      .lean();

    if (!doc) return null;
    const advisor = UserMapper.mapDocToUser(doc.advisorId);

    const tags: TagEntity[] = (doc.tagsId || [])
      .map((tagDoc: any) => this.mapDocToTag(tagDoc))
      .filter((tag: TagEntity) => !!tag);
    return this.combinePostWithTagsAndUser(doc, advisor, tags);
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
    await this.client.connect();

    const match: any = {};

    if (filters.dateFrom) {
      match.createdAt = { ...(match.createdAt || {}), $gte: filters.dateFrom };
    }
    if (filters.dateTo) {
      match.createdAt = { ...(match.createdAt || {}), $lte: filters.dateTo };
    }
    if (filters.title) {
      match.title = { $regex: filters.title, $options: "i" };
    }
    if (typeof filters.status === "boolean") {
      match.publishedAt = filters.status ? { $ne: null } : null;
    }
    if (filters.tagsId?.length) {
      match.tagsId = { $in: filters.tagsId };
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const limit = pagination.limit;

    const docs = await PostModel.find(match)
      .populate({
        path: "advisorId",
        select:
          "firstname lastname email passwordHash role isActive createdAt confirmedAt updatedAt",
      })
      .populate({
        path: "tagsId",
        select: "label color createdAt updatedAt",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<any[]>();

    const total = await PostModel.countDocuments(match);

    const posts: PostWithTagsAndUser[] = docs
      .map((doc) => {
        if (!doc.advisorId) return null;

        const advisor = UserMapper.mapDocToUser(doc.advisorId);

        const tags: TagEntity[] = (doc.tagsId || [])
          .map((tagDoc: any) => this.mapDocToTag(tagDoc))
          .filter((tag: TagEntity) => !!tag);
        return this.combinePostWithTagsAndUser(doc, advisor, tags);
      })
      .filter((post): post is PostWithTagsAndUser => post !== null);

    return { posts, total: Math.ceil(total / pagination.limit) };
  }

  /** 🔍 Posts non lus avec tags */
  async findAllUnreadWithTags(
    userId: UserEntity["id"]
  ): Promise<PostWithTagsAndUser[]> {
    await this.client.connect();

    const docs = await PostModel.find({
      publishedAt: { $ne: null },
      readBy: { $nin: [userId] },
      $or: [{ clientId: null }, { clientId: userId }],
    })
      .populate({
        path: "advisorId",
        select:
          "firstname lastname email passwordHash role isActive createdAt confirmedAt updatedAt",
      })
      .populate({
        path: "tagsId",
        select: "label color createdAt updatedAt",
      })
      .sort({ publishedAt: -1 })
      .lean<any[]>();

    const posts: PostWithTagsAndUser[] = docs
      .map((doc) => {
        if (!doc.advisorId) return null;

        const advisor = UserMapper.mapDocToUser(doc.advisorId);

        const tags: TagEntity[] = (doc.tagsId || [])
          .map((tagDoc: any) => this.mapDocToTag(tagDoc))
          .filter((tag: TagEntity) => !!tag);

        return this.combinePostWithTagsAndUser(doc, advisor, tags);
      })
      .filter((post): post is PostWithTagsAndUser => post !== null);

    return posts;
  }
}
