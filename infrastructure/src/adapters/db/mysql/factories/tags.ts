import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { TagRepositoryMySQL } from "../repositories/TagRepositoryMySQL";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

import { CreateTagUseCase } from "@application/usecases/tags/CreateTagUseCase";
import { GetTagByIdUseCase } from "@application/usecases/tags/GetTagByIdUseCase";
import { GetAllTagsUseCase } from "@application/usecases/tags/GetAllTagsUseCase";
import { UpdateTagUseCase } from "@application/usecases/tags/UpdateTagUseCase";
import { DeleteTagUseCase } from "@application/usecases/tags/DeleteTagUseCase";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";

export const tagsFactory = () => {
  const client = new MySQLClient();
  const tagRepository = new TagRepositoryMySQL(client);
  const userRepository = new UserRepositoryMySQL(client);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const createTag = new CreateTagUseCase(
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
