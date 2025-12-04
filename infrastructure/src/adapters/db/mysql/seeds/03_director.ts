import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawDirectors } from "../../seeds/director";

<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
export async function seedSQLDirector(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Directeurs --");
========
export async function seedSQLClient(mysqlClient: MySQLClient) {
  console.log("🌱 Client");

>>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/mysql/seeds/01_client.ts
=======
import { UserRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawDirectors } from "../raws/director";

export async function seedSQLDirector(mysqlClient: MySQLClient) {
  console.log("director");
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts

  const users = [];
  for (const raw of rawDirectors) {
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) {
        console.warn(email);
        continue;
      }
=======
  for (const raw of rawDirectors) {
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) return;
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
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
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts

      users.push(user);
========
      console.log(user);
>>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/mysql/seeds/01_client.ts
      userRepository.save(user);
      console.log(user.id);
=======

      userRepository.save(user);
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
  return users;
=======
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
}
