import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/UserRepositoryMongo";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawDirectors } from "../../seeds/director";

export async function seedMongoDirector(
  mongoClient: MongoClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Directeurs (Mongo) --");

  await mongoClient.connect();

  const userRepository = new UserRepositoryMongo(mongoClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const users: UserEntity[] = [];

  for (const raw of rawDirectors) {
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
        role: "directeur",
        createdAt: clockService.now(),
        isActiveField: true,
      });

      await userRepository.save(user);
      users.push(user);

      console.log(user.email.value);
    } catch (err) {
      console.error(`Skipping user ${raw.email}`, err);
    }
  }

  return users;
}
