import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/06_tags.ts
import { TagRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/TagRepositoryMySQL";
import { TagEntity } from "@domain/entities/TagEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawTags } from "../../seeds/tags";
import { Color } from "@domain/values/Color";
=======
import { TagRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/TagRepositoryMySQL";
import { TagEntity } from "@domain/entities/TagEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawTags } from "../raws/tags";
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/06_tags.ts
=======
import { TagRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/TagRepositoryMySQL";
import { TagEntity } from "@domain/entities/TagEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawTags } from "../../seeds/tags";
>>>>>>> 2ce9cab (thread)

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
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/06_tags.ts
    const c = Color.from(raw.color);
    if (c instanceof Error) continue;
    const tag = TagEntity.from({
      id: uuidService.generate(),
      label: raw.label,
      color: c,
=======
    const tag = TagEntity.from({
      id: uuidService.generate(),
      label: raw.label,
      color: raw.color,
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/06_tags.ts
      createdAt: now,
      modifiedAt: now,
    });

    await tagRepository.save(tag);
    tags.push(tag);
    console.log(tag.id);
  }

  return tags;
};
