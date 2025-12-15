import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { PostRepositoryMongo } from "../repositories/PostRepositoryMongo";
import { TagRepositoryMongo } from "../repositories/TagRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AddPostUsecase } from "@application/usecases/posts/admin/AddPostUsecase";
import { DeletePostUsecase } from "application/src/usecases/posts/DeletePostUsecase";
import { EditPostUsecase } from "@application/usecases/posts/admin/EditPostUsecase";
import { MarkPostAsReadUsecase } from "@application/usecases/posts/client/MarkPostAsReadUsecase";
import { PublishPostUsecase } from "@application/usecases/posts/admin/PublishPostUsecase";
import { UnpublishPostUsecase } from "@application/usecases/posts/admin/UnpublishPostUsecase";
import { UpdateTagsPostUsecase } from "application/src/usecases/posts/UpdateTagsPostUsecase";
import { AdminFindPostWithFilterUsecase } from "@application/usecases/posts/admin/AdminFindPostWithFilterUsecase";
import { ClientFindPostWithFilterUsecase } from "@application/usecases/posts/client/ClientFindPostWithFilterUsecase";
import { AdminFindPostByIdWithTagsUsecase } from "@application/usecases/posts/admin/AdminFindPostByIdWithTagsUsecase";
import { FindPostByIdWithTagsUsecase } from "@application/usecases/posts/client/ClientFindPostByIdWithTagsUsecase";
import { GetUnreadPostWithTag } from "@application/usecases/posts/client/ClientFindUnreadPostWithTag";

export const postsFactory = () => {
  const client = new MongoClient();
  const userRepository = new UserRepositoryMongo(client);
  const tagRepository = new TagRepositoryMongo(client);
  const feedRepository = new PostRepositoryMongo(client);
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
  const clientFindPostByIdWithTags = new FindPostByIdWithTagsUsecase(
    feedRepository,
    userRepository
  );
  const clientFindUnreadPostWithTags = new GetUnreadPostWithTag(
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
