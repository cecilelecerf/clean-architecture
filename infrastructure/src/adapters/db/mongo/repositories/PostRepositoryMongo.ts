import { PostRepository, PostWithTagsAndUser } from "@application/ports/repositories/PostRepository";
import { MongoClient } from "../../MongoClient";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { PostModel } from "../models/PostModel";
import { Color } from "@domain/values/Color";
import { TagModel } from "../models/TagModel";
import { UserModel } from "../models/UserModel";

export class PostRepositoryMongo implements PostRepository {
    constructor(private readonly client: MongoClient) {}

    async save(post: PostEntity): Promise<void> {
      await this.client.connect();
                              
      await PostModel.create({
        advisorId: post.advisorId,
        title: post.title,
        content: post.content,
        tagsId: post.tagsId,
        createdAt: post.createdAt,
        readBy: post.readBy,
        modifiedAt: post.modifiedAt ?? null,
        publishedAt: post.publishedAt,
        clientId: post.clientId
      } as any);
    }

    async findById(id: PostEntity["id"]): Promise<PostEntity | null> {
      await this.client.connect();
      
      const doc = await PostModel.findOne({ _id: id }).lean();
      if (!doc) return null;

      return PostEntity.from({
        id: doc._id.toString(),
        advisorId: doc.advisorId,
        title: doc.title,
        content: doc.content,
        tagsId: doc.tagsId,
        createdAt: doc.createdAt,
        readBy: doc.readBy,
        modifiedAt: doc.modifiedAt ?? null,
        publishedAt: doc.publishedAt ?? null,
        clientId: doc.clientId ?? null
      });
    }

    async findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<PostEntity[]> {
      await this.client.connect();
      
      const docs = await PostModel.find({ advisorId }).lean();

      return docs.map((doc) => {
        return PostEntity.from({
          id: doc._id.toString(),
          advisorId: doc.advisorId,
          title: doc.title,
          content: doc.content,
          tagsId: doc.tagsId,
          createdAt: doc.createdAt,
          readBy: doc.readBy,
          modifiedAt: doc.modifiedAt ?? null,
          publishedAt: doc.publishedAt ?? null,
          clientId: doc.clientId ?? null
        });
      })
    }
    
    async findAllRecent(limit: number = 10): Promise<PostEntity[]> {
        await this.client.connect();

        const docs = await PostModel.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return docs.map((doc) =>
            PostEntity.from({
                id: doc._id.toString(),
                advisorId: doc.advisorId,
                title: doc.title,
                content: doc.content,
                tagsId: doc.tagsId,
                createdAt: doc.createdAt,
                modifiedAt: doc.modifiedAt ?? null,
                publishedAt: doc.publishedAt ?? null,
                readBy: doc.readBy,
                clientId: doc.clientId ?? null,
            })
        );
    }

    async update(post: PostEntity): Promise<void> {
      await this.client.connect();
                                      
      await PostModel.findByIdAndUpdate(
        post.id,
        {
            $set: {
                title: post.title,
                content: post.content,
                modifiedAt: post.modifiedAt || new Date(),
                publishedAt: post.publishedAt || null,
                tagsId: post.tagsId,
                readBy: post.readBy,
            },
        },
        { new: true }
      );
    }

    async delete(id: PostEntity["id"]): Promise<void> {
      await this.client.connect();
                                      
      await PostModel.deleteOne({ _id: id });
    }

    async findAllByTags(tagId: TagEntity["id"]): Promise<PostEntity[]> {
      await this.client.connect();
      
      const docs = await PostModel.find({ tagsId: tagId }).lean();

      return docs.map((doc) => {
        return PostEntity.from({
          id: doc._id.toString(),
          advisorId: doc.advisorId,
          title: doc.title,
          content: doc.content,
          tagsId: doc.tagsId,
          createdAt: doc.createdAt,
          readBy: doc.readBy,
          modifiedAt: doc.modifiedAt ?? null,
          publishedAt: doc.publishedAt ?? null,
          clientId: doc.clientId ?? null
        });
      })
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

        const docs = await PostModel.aggregate([
          { $match: match },
          {
            $lookup: {
              from: "users",
              localField: "advisorId",
              foreignField: "_id",
              as: "advisor",
            },
          },
          { $unwind: "$advisor" },
          {
            $lookup: {
              from: "tags",
              localField: "tagsId",
              foreignField: "_id",
              as: "tags",
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]).exec();

        const total = await PostModel.countDocuments(match);

        const posts: PostWithTagsAndUser[] = docs.map((doc: any) => {
          const advisor = UserEntity.from({
            id: doc.advisor._id.toString(),
            firstname: doc.advisor.firstname,
            lastname: doc.advisor.lastname,
            email: doc.advisor.email,
            passwordHash: doc.advisor.passwordHash,
            role: doc.advisor.role,
            isActiveField: doc.advisor.isActive,
            createdAt: doc.advisor.createdAt,
            confirmedAt: doc.advisor.confirmedAt,
            modifiedAt: doc.advisor.modifiedAt,
          });

          const tags = doc.tags.map((tag: any) =>{
            const colorResult = Color.from(tag.color);
            if (colorResult instanceof Error) {
              return colorResult;
            }
            TagEntity.from({
              id: tag._id.toString(),
              label: tag.label,
              color: colorResult,
              createdAt: tag.createdAt,
              modifiedAt: tag.modifiedAt,
            })
          }); 

          const post = PostEntity.from({
            id: doc._id.toString(),
            advisorId: doc.advisorId.toString(),
            title: doc.title,
            content: doc.content,
            tagsId: doc.tagsId,
            createdAt: doc.createdAt,
            modifiedAt: doc.modifiedAt ?? undefined,
            publishedAt: doc.publishedAt ?? undefined,
            readBy: doc.readBy ?? [],
            clientId: doc.clientId ?? undefined,
          });

          return Object.assign(post, { tags, advisor });
        });

        return { posts, total: Math.ceil(total / pagination.limit) };
      }
    
    async findWithTagsAndUserById(
        id: PostEntity["id"]
    ): Promise<PostWithTagsAndUser | null> {
      await this.client.connect();

      const doc = await PostModel.findById(id).lean();
      if (!doc) return null;

      const tags: TagEntity[] = [];
      for (const tagId of doc.tagsId) {
        const tagDoc = await TagModel.findById(tagId).lean();
        if (!tagDoc) continue;

        let color = Color.from(tagDoc.color);
        if (color instanceof Error) {
          console.warn(`Couleur invalide pour le tag ${tagId}: ${color.message}`);
          const fallback = Color.from("#000000");
          if (fallback instanceof Error) {
            throw new Error("Fallback color failed");
          }
          color = fallback;
        }

        tags.push(
          TagEntity.from({
            id: tagDoc._id.toString(),
            label: tagDoc.label,
            color,
            createdAt: tagDoc.createdAt,
            modifiedAt: tagDoc.modifiedAt,
          })
        );
      }

      const advisorDoc = await UserModel.findById(doc.advisorId).lean();
      if (!advisorDoc) throw new Error(`Advisor not found: ${doc.advisorId}`);
      const advisor = UserEntity.from({
        id: advisorDoc._id.toString(),
        firstname: advisorDoc.firstname,
        lastname: advisorDoc.lastname,
        email: advisorDoc.email,
        passwordHash: advisorDoc.passwordHash,
        role: advisorDoc.role,
        isActiveField: advisorDoc.isActive,
        createdAt: advisorDoc.createdAt,
        confirmedAt: advisorDoc.confirmedAt,
        modifiedAt: advisorDoc.modifiedAt,
      });

      const post = PostEntity.from({
        id: doc._id.toString(),
        advisorId: doc.advisorId,
        title: doc.title,
        content: doc.content,
        tagsId: doc.tagsId,
        createdAt: doc.createdAt,
        modifiedAt: doc.modifiedAt ?? undefined,
        publishedAt: doc.publishedAt ?? undefined,
        readBy: doc.readBy ?? [],
        clientId: doc.clientId ?? undefined,
      });

      return Object.assign(post, { tags, advisor });
    }

    async findAllUnreadWithTags(
        userId: UserEntity["id"]
    ): Promise<PostWithTagsAndUser[]> {
      await this.client.connect();

      const postDocs = await PostModel.find({
        publishedAt: { $ne: null },
        readBy: { $nin: [userId] },
      }).sort({ createdAt: -1 }).lean();

      const posts: PostWithTagsAndUser[] = [];

      for (const doc of postDocs) {
        const tagDocs = await TagModel.find({ _id: { $in: doc.tagsId } }).lean();
        const tags: TagEntity[] = tagDocs.map(tagDoc => {
          let color = Color.from(tagDoc.color);
          if (color instanceof Error) {
            console.warn(`Couleur invalide pour le tag ${tagDoc._id}: ${color.message}`);
            const fallback = Color.from("#000000");
            if (fallback instanceof Error) throw new Error("Fallback color failed");
            color = fallback;
          }
          return TagEntity.from({
            id: tagDoc._id.toString(),
            label: tagDoc.label,
            color,
            createdAt: tagDoc.createdAt,
            modifiedAt: tagDoc.modifiedAt,
          });
        });

        const advisorDoc = await UserModel.findById(doc.advisorId).lean();
        if (!advisorDoc) continue;

        const advisor = UserEntity.from({
          id: advisorDoc._id.toString(),
          firstname: advisorDoc.firstname,
          lastname: advisorDoc.lastname,
          email: advisorDoc.email,
          passwordHash: advisorDoc.passwordHash,
          role: advisorDoc.role,
          isActiveField: advisorDoc.isActive,
          createdAt: advisorDoc.createdAt,
          confirmedAt: advisorDoc.confirmedAt,
          modifiedAt: advisorDoc.modifiedAt,
        });

        const post = PostEntity.from({
          id: doc._id.toString(),
          advisorId: doc.advisorId,
          title: doc.title,
          content: doc.content,
          tagsId: doc.tagsId,
          createdAt: doc.createdAt,
          modifiedAt: doc.modifiedAt ?? undefined,
          publishedAt: doc.publishedAt ?? undefined,
          readBy: doc.readBy,
          clientId: doc.clientId ?? undefined,
        });

        posts.push(Object.assign(post, { tags, advisor }));
      }

      return posts;
    }
      
}