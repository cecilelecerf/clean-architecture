import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AddPostUsecase } from "@application/usecases/posts/AddPostUsecase";
import { DeletePostUsecase } from "@application/usecases/posts/DeletePostUsecase";
import { EditPostUsecase } from "@application/usecases/posts/EditPostUsecase";
import { MarkPostAsReadUsecase } from "@application/usecases/posts/MarkPostAsReadUsecase";
import { PublishPostUsecase } from "@application/usecases/posts/PublishPostUsecase";
import { UnpublishPostUsecase } from "@application/usecases/posts/UnpublishPostUsecase";
import { UpdateTagsPostUsecase } from "@application/usecases/posts/UpdateTagsPostUsecase";
import { PostRepositoryMySQL } from "../repositories/PostRepositoryMySQL";
import { TagRepositoryMySQL } from "../repositories/TagRepositoryMySQL";
import { AdminFindPostWithFilterUsecase } from "@application/usecases/posts/AdminFindPostWithFilterUsecase";
import { AdminFindPostByIdWithTagsUsecase } from "@application/usecases/posts/AdminFindPostByIdWithTagsUsecase";

export const postsFactory = () => {
  const client = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(client);
  const tagRepository = new TagRepositoryMySQL(client);
  const feedRepository = new PostRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const addPost = new AddPostUsecase(
    feedRepository,
    tagRepository,
    userRepository,
    uuidService,
    clockService
  );
  const deletePost = new DeletePostUsecase(feedRepository, userRepository);
  const editPost = new EditPostUsecase(
    feedRepository,
    userRepository,
    tagRepository,
    clockService
  );
  const markPostAsRead = new MarkPostAsReadUsecase(
    feedRepository,
    userRepository
  );
  const publishPost = new PublishPostUsecase(
    feedRepository,
    userRepository,
    clockService
  );
  const unpublishPost = new UnpublishPostUsecase(
    feedRepository,
    userRepository
  );
  const updateTagsPost = new UpdateTagsPostUsecase(
    feedRepository,
    userRepository,
    tagRepository
  );
  const adminFindPostWithFilter = new AdminFindPostWithFilterUsecase(
    feedRepository,
    userRepository
  );
  const adminFindPostByIdWithTags = new AdminFindPostByIdWithTagsUsecase(
    feedRepository,
    userRepository
  );

  return {
    addPost,
    deletePost,
    editPost,
    markPostAsRead,
    publishPost,
    unpublishPost,
    updateTagsPost,
    adminFindPostWithFilter,
    adminFindPostByIdWithTags,
  };
};
