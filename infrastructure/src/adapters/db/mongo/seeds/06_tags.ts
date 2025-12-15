import { MongoClient } from "../../MongoClient";
import { TagRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/TagRepositoryMongo";
import { TagEntity } from "@domain/entities/TagEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawTags } from "../../seeds/tags";
import { Color } from "@domain/values/Color";

/**
 * Génère une liste de tags prédéfinis et les enregistre dans MongoDB.
 */
export const generateTagsMongo = async (
  mongoClient: MongoClient
): Promise<TagEntity[]> => {
  console.log("-- Création des tags (Mongo) --");

  await mongoClient.connect();

  const tagRepository = new TagRepositoryMongo(mongoClient);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const now = clockService.now();
  const tags: TagEntity[] = [];

  for (const raw of rawTags) {
    const color = Color.from(raw.color);
    if (color instanceof Error) continue;

    const tag = TagEntity.from({
      id: uuidService.generate(),
      label: raw.label,
      color,
      createdAt: now
    });

    await tagRepository.save(tag);
    tags.push(tag);
    console.log(tag.id);
  }

  return tags;
};
