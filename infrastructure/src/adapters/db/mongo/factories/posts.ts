import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { DeletePostUsecase } from "application/src/usecases/posts/DeletePostUsecase";
import { UpdateTagsPostUsecase } from "application/src/usecases/posts/UpdateTagsPostUsecase";
import { AddPostUsecase } from "@application/usecases/posts/AddPostUsecase";
import { EditPostUsecase } from "@application/usecases/posts/EditPostUsecase";
import { MarkPostAsReadUsecase } from "@application/usecases/posts/MarkPostAsReadUsecase";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { TagRepositoryMongo } from "../repositories/TagRepositoryMongo";
import { PostRepositoryMongo } from "../repositories/PostRepositoryMongo";
import { UpdatePostStatusUsecase } from "@application/usecases/posts/UpdatePostStatusUsecase";
import { FindPostByIdWithTagsUsecase as GetPostByIdWithTagsUsecase } from "@application/usecases/posts/FindPostByIdWithTagsUsecase";
import { FindPostWithFilterUsecase as GetPostWithFilterUsecase } from "@application/usecases/posts/FindPostWithFilterUsecase";
import { GetUnreadPostWithTagUsecase } from "@application/usecases/posts/GetUnreadPostWithTagUsecase";

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
  const updatePostStatusPost = new UpdatePostStatusUsecase(
    feedRepository,
    userRepository,
    clockService
  );
  const updateTagsPost = new UpdateTagsPostUsecase(
    feedRepository,
    userRepository,
    tagRepository
  );
  const getPostWithFilter = new GetPostWithFilterUsecase(
    feedRepository,
    userRepository
  );
  const getPostByIdWithTags = new GetPostByIdWithTagsUsecase(
    feedRepository,
    userRepository
  );
  const getUnreadPostWithTag = new GetUnreadPostWithTagUsecase(
    feedRepository,
    userRepository
  );
  return {
    getPostWithFilter,
    getPostByIdWithTags,
    addPost,
    editPost,
    markPostAsRead,
    updatePostStatusPost,
    updateTagsPost,
    deletePost,
    getUnreadPostWithTag,
  };
};
