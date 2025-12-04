import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawAdvisors } from "../../seeds/advisors";

<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
export async function seedSQLAdministrator(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
========
export async function seedSQLAdministrator(mysqlClient: MySQLClient) {
  console.log("aministrator");
>>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/mysql/seeds/02_advisor.ts
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
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
  return advisors;
}
