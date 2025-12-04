import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawAdvisors } from "../../seeds/advisors";

<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
export async function seedSQLAdministrator(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
========
export async function seedSQLAdministrator(mysqlClient: MySQLClient) {
  console.log("aministrator");
>>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/mysql/seeds/02_advisor.ts
=======
export async function seedSQLDirector(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Directeurs --");
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
  const advisors: UserEntity[] = [];

  for (const raw of rawAdvisors) {
=======
  const users = [];
  for (const raw of rawDirectors) {
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
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

<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
      advisors.push(user);
=======
      users.push(user);
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
      userRepository.save(user);
      console.log(user.id);
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
  return advisors;
=======
  return users;
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
}
