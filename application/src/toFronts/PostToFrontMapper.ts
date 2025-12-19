import { PostWithTagsAndUser } from "@application/ports/repositories/PostRepository";
import { PostEntity } from "@domain/entities/PostEntity";
import { TagToFront } from "@domain/entities/TagEntity";
import { UserToFront } from "@domain/entities/UserEntity";

export type PostWithTagsAndUsersToFront = PostEntity & {
  advisor: UserToFront;
  tags: TagToFront[];
};

export class PostToFrontMapper {
  static map(post: PostWithTagsAndUser): PostWithTagsAndUsersToFront {
    return Object.assign(post, {
      advisor: post.advisor.toFront(),
      tags: post.tags.map((t) => t.toFront()),
    });
  }
  static maps(posts: PostWithTagsAndUser[]): PostWithTagsAndUsersToFront[] {
    return posts.map((post) => this.map(post));
  }
}
