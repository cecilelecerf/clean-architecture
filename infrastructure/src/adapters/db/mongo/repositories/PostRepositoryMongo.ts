import { PostRepository, PostWithTagsAndUser } from "@application/ports/repositories/PostRepository";
import { MongoClient } from "../../MongoClient";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { PostModel } from "../models/PostModel";

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

    async findById(id: PostEntity["id"]): Promise<PostEntity | null> {}

    async findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<PostEntity[]> {}
    
    async findAllRecent(limit = 10): Promise<PostEntity[]> {}

    async update(post: PostEntity): Promise<void> {}

    async delete(id: PostEntity["id"]): Promise<void> {}

    async findAllByTags(tagId: TagEntity["id"]): Promise<PostEntity[]> {}

     async findAllPaginatedWithTagsAndUserByFilters(
        filters: {
          dateFrom?: Date;
          dateTo?: Date;
          tagsId?: string[];
          title?: string;
          status?: boolean;
        },
        pagination: { page: number; limit: number }
      ): Promise<{ posts: PostWithTagsAndUser[]; total: number }> {}
    
    async findWithTagsAndUserById(
        id: PostEntity["id"]
    ): Promise<PostWithTagsAndUser | null> {}

    async findAllUnreadWithTags(
        userId: UserEntity["id"]
    ): Promise<PostWithTagsAndUser[]> {}
      
}