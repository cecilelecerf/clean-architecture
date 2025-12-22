import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { MongoClient } from "../../MongoClient";
import { TagRepositoryMongo } from "../repositories/TagRepositoryMongo";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { AddTagUseCase } from "@application/usecases/tags/CreateTagUsecase";
import { GetTagByIdUseCase } from "@application/usecases/tags/GetTagByIdUseCase";
import { GetAllTagsUseCase } from "@application/usecases/tags/GetAllTagsUseCase";
import { UpdateTagUseCase } from "@application/usecases/tags/UpdateTagUseCase";
import { DeleteTagUseCase } from "@application/usecases/tags/DeleteTagUseCase";

export const tagsFactory = () => {
  const client = new MongoClient();
  const tagRepository = new TagRepositoryMongo(client);
  const userRepository = new UserRepositoryMongo(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const createTag = new AddTagUseCase(
    tagRepository,
    userRepository,
    uuidService,
    clockService
  );
  const getTagById = new GetTagByIdUseCase(tagRepository, userRepository);
  const getAllTags = new GetAllTagsUseCase(tagRepository);
  const updateTag = new UpdateTagUseCase(tagRepository, userRepository);
  const deleteTag = new DeleteTagUseCase(tagRepository, userRepository);

  return {
    createTag,
    getTagById,
    getAllTags,
    updateTag,
    deleteTag,
  };
};
