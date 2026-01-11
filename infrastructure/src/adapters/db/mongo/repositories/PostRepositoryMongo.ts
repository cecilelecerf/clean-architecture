import {
  PostRepository,
  PostWithTags,
  PostWithTagsAndUser,
} from "@application/ports/repositories/PostRepository";
import { MongoClient } from "../../MongoClient";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { PostModel } from "../models/PostModel";
import { Color } from "@domain/values/Color";
import { UserMapper } from "../../mappers/UserMapper";

export class PostRepositoryMongo implements PostRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToPost(doc: any): PostEntity {
    return PostEntity.from({
      id: doc._id.toString(),
      advisorId: doc.advisorId._id
        ? doc.advisorId._id.toString()
        : doc.advisorId?.toString(),
      title: doc.title,
      content: doc.content,
      tagsId:
        doc.tagsId?.map((t: any) =>
          t._id ? t._id.toString() : t.toString()
        ) || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt ?? null,
      publishedAt: doc.publishedAt ?? null,
      readBy: doc.readBy?.map((r: any) => r.toString()) || [],
      clientId: doc.clientId ? doc.clientId.toString() : undefined,
    });
  }

  private mapDocToTag(doc: any): TagEntity | undefined {
    const color = Color.from(doc.color);
    return TagEntity.from({
      id: doc._id.toString(),
      label: doc.label,
      color,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private combinePostWithTags(doc: any, tags: TagEntity[]): PostWithTags {
    const post = this.mapDocToPost(doc);
    return Object.assign(post, { tags });
  }

  private combinePostWithTagsAndUser(
    doc: any,
    advisor: UserEntity,
    tags: TagEntity[]
  ): PostWithTagsAndUser {
    const post = this.mapDocToPost(doc);
    return Object.assign(post, { advisor, tags });
  }

  async save(post: PostEntity): Promise<void> {
    await this.client.connect();

    await PostModel.create({
      _id: post.id,
      advisorId: post.advisorId,
      title: post.title,
      content: post.content,
      tagsId: post.tagsId,
      readBy: post.readBy,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt ?? null,
      publishedAt: post.publishedAt,
      clientId: post.clientId,
    });
  }

  async findById(id: PostEntity["id"]): Promise<PostEntity | null> {
    await this.client.connect();
    const doc = await PostModel.findById(id).lean();
    if (!doc) return null;
    return this.mapDocToPost(doc);
  }

  async findAllRecent(limit = 10): Promise<PostEntity[]> {
    await this.client.connect();
    const docs = await PostModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map(this.mapDocToPost);
  }

  async update(post: PostEntity): Promise<void> {
    await this.client.connect();
    await PostModel.updateOne(
      { _id: post.id },
      {
        $set: {
          title: post.title,
          content: post.content,
          updatedAt: post.updatedAt ?? new Date(),
          publishedAt: post.publishedAt ?? null,
          tagsId: post.tagsId,
          readBy: post.readBy,
        },
      }
    );
  }

  async delete(id: PostEntity["id"]): Promise<void> {
    await this.client.connect();
    await PostModel.deleteOne({ _id: id });
  }

  async findWithTagsAndUserById(
    id: PostEntity["id"]
  ): Promise<PostWithTagsAndUser | null> {
    await this.client.connect();

    const doc = await PostModel.findById(id)
      .populate({ path: "advisorId" })
      .populate({ path: "tagsId" })
      .lean();

    if (!doc || !doc.advisorId) return null;

    const advisor = UserMapper.mapDocToUser(doc.advisorId);

    const tags: TagEntity[] = (doc.tagsId || [])
      .map(this.mapDocToTag)
      .filter((t: any): t is TagEntity => !!t);
    return this.combinePostWithTagsAndUser(doc, advisor, tags);
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
    await this.client.connect();
    const match: any = {};

    if (filters.dateFrom)
      match.createdAt = { ...(match.createdAt || {}), $gte: filters.dateFrom };
    if (filters.dateTo)
      match.createdAt = { ...(match.createdAt || {}), $lte: filters.dateTo };
    if (filters.title) match.title = { $regex: filters.title, $options: "i" };
    if (typeof filters.status === "boolean")
      match.publishedAt = filters.status ? { $ne: null } : null;
    if (filters.tagsId?.length) match.tagsId = { $in: filters.tagsId };

    const skip = (pagination.page - 1) * pagination.limit;
    const limit = pagination.limit;

    const docs = await PostModel.find(match)
      .populate({ path: "advisorId" })
      .populate({ path: "tagsId" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await PostModel.countDocuments(match);

    const posts: PostWithTagsAndUser[] = docs
      .map((doc) => {
        if (!doc.advisorId) return null;
        const advisor = UserMapper.mapDocToUser(doc.advisorId);
        const tags: TagEntity[] = (doc.tagsId || [])
          .map(this.mapDocToTag)
          .filter((t: TagEntity | undefined): t is TagEntity => !!t);
        return this.combinePostWithTagsAndUser(doc, advisor, tags);
      })
      .filter((p): p is PostWithTagsAndUser => p !== null);

    return { posts, total };
  }

  async findAllUnreadWithTags(
    userId: UserEntity["id"]
  ): Promise<PostWithTagsAndUser[]> {
    await this.client.connect();

    const docs = await PostModel.find({
      publishedAt: { $ne: null },
      readBy: { $nin: [userId] },
      $or: [{ clientId: null }, { clientId: userId }],
    })
      .populate({ path: "advisorId" })
      .populate({ path: "tagsId" })
      .sort({ publishedAt: -1 })
      .lean();
    const posts: PostWithTagsAndUser[] = docs
      .map((doc) => {
        if (!doc.advisorId) return null;
        const advisor = UserMapper.mapDocToUser(doc.advisorId);
        const tags: TagEntity[] = (doc.tagsId || [])
          .map(this.mapDocToTag)
          .filter((t: TagEntity | undefined): t is TagEntity => !!t);
        return this.combinePostWithTagsAndUser(doc, advisor, tags);
      })
      .filter((p): p is PostWithTagsAndUser => p !== null);

    return posts;
  }
}
