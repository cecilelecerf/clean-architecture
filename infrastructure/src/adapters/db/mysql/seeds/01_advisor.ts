import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawAdvisors } from "../../seeds/advisors";
import { rand } from "./utils";

export async function seedSQLAdministrator(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  const userRepository = new UserRepositoryMySQL(mysqlClient);
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
      const now = clockService.now()
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
        role: "conseiller",
        createdAt: now,
        isActiveField: true,
        confirmedAt: now,
                                        updatedAt:   Math.random() < 0.3
                                                ? clockService.addDays(now, rand(1, 10))
                                                :  clockService.nowMinusDays(rand(0, 60))
      });

      advisors.push(user);
      userRepository.save(user);
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
  return advisors;
}
