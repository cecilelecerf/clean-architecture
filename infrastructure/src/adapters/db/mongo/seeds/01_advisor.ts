import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawAdvisors } from "../../seeds/advisors";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";

export async function seedMongoAdministrator(
  mongoClient: MongoClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Conseiller Mongo --");

  const userRepository = new UserRepositoryMongo(mongoClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const advisors: UserEntity[] = [];

  for (const raw of rawAdvisors) {
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) {
        console.warn(email);
        continue;
      }
      const passwordHash = await hasher.hash(raw.password);
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
        role: "conseiller",
        createdAt: clockService.now(),
        isActiveField: true,
        confirmedAt: clockService.now(),
      });

      advisors.push(user);
      userRepository.save(user);
      console.log(user.id);
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
  return advisors;
}
