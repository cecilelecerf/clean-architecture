import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { TagRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/TagRepositoryMySQL";
import { TagEntity } from "@domain/entities/TagEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawTags } from "../raws/tags";

/**
 * Génère une liste de tags prédéfinis et les enregistre dans la base.
 */
export const generateTags = async (
  mySqlClient: MySQLClient
): Promise<TagEntity[]> => {
  console.log("-- Création des tags --");
  const tagRepository = new TagRepositoryMySQL(mySqlClient);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const now = clockService.now();

  const tags: TagEntity[] = [];

  for (const raw of rawTags) {
    const tag = TagEntity.from({
      id: uuidService.generate(),
      label: raw.label,
      color: raw.color,
      createdAt: now,
      modifiedAt: now,
    });

    await tagRepository.save(tag);
    tags.push(tag);
    console.log(tag.id);
  }

  return tags;
};
