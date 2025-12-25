import { PostWithTagsAndUser } from "@application/ports/repositories/PostRepository";
import { PostDTO } from "@domain/entities/PostEntity";
import { TagDTO } from "@domain/entities/TagEntity";
import { UserToDTO } from "@domain/entities/UserEntity";

export type PostWithTagsAndUsersDTO = PostDTO & {
  advisor: UserToDTO;
  tags: TagDTO[];
};

export class PostDTOMapper {
  static map(post: PostWithTagsAndUser): PostWithTagsAndUsersDTO {
    return Object.assign(post.toDTO(), {
      advisor: post.advisor.toDTO(),
      tags: post.tags.map((t) => t.toDTO()),
    });
  }
  static maps(posts: PostWithTagsAndUser[]): PostWithTagsAndUsersDTO[] {
    return posts.map((post) => this.map(post));
  }
}
