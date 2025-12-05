import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AddPostUsecase } from "@application/usecases/posts//admin/AddPostUsecase";
import { DeletePostUsecase } from "@application/usecases/posts/admin/DeletePostUsecase";
import { EditPostUsecase } from "@application/usecases/posts/admin/EditPostUsecase";
import { MarkPostAsReadUsecase } from "@application/usecases/posts/client/MarkPostAsReadUsecase";
import { PublishPostUsecase } from "@application/usecases/posts/admin/PublishPostUsecase";
import { UnpublishPostUsecase } from "@application/usecases/posts/admin/UnpublishPostUsecase";
import { UpdateTagsPostUsecase } from "@application/usecases/posts/admin/UpdateTagsPostUsecase";
import { PostRepositoryMySQL } from "../repositories/PostRepositoryMySQL";
import { TagRepositoryMySQL } from "../repositories/TagRepositoryMySQL";
import { AdminFindPostWithFilterUsecase } from "@application/usecases/posts/admin/AdminFindPostWithFilterUsecase";
import { ClientFindPostWithFilterUsecase } from "@application/usecases/posts/client/ClientFindPostWithFilterUsecase";
import { AdminFindPostByIdWithTagsUsecase } from "@application/usecases/posts/admin/AdminFindPostByIdWithTagsUsecase";
import { ClientFindPostByIdWithTagsUsecase } from "@application/usecases/posts/client/ClientFindPostByIdWithTagsUsecase";
import { ClientFindUnreadPostWithTag } from "@application/usecases/posts/client/ClientFindUnreadPostWithTag";

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
  const clientFindPostWithFilter = new ClientFindPostWithFilterUsecase(
    feedRepository,
    userRepository
  );
  const adminFindPostByIdWithTags = new AdminFindPostByIdWithTagsUsecase(
    feedRepository,
    userRepository
  );
  const clientFindPostByIdWithTags = new ClientFindPostByIdWithTagsUsecase(
    feedRepository,
    userRepository
  );
  const clientFindUnreadPostWithTags = new ClientFindUnreadPostWithTag(
    feedRepository,
    userRepository
  );

  return {
    admin: {
      addPost,
      deletePost,
      editPost,
      publishPost,
      unpublishPost,
      updateTagsPost,
      adminFindPostWithFilter,
      adminFindPostByIdWithTags,
    },
    client: {
      markPostAsRead,
      clientFindPostWithFilter,
      clientFindPostByIdWithTags,
      clientFindUnreadPostWithTags,
    },
  };
};
