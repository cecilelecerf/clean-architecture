import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
=======
>>>>>>> 2ce9cab (thread)
import { UserRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
<<<<<<< HEAD
import { rawDirectors } from "../../seeds/director";

<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
=======
<<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
import { rawAdvisors } from "../../seeds/advisors";
========
import { rawDirectors } from "../../seeds/director";
>>>>>>>> 2ce9cab (thread):infrastructure/src/adapters/db/mysql/seeds/03_director.ts

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
>>>>>>> 2ce9cab (thread)
export async function seedSQLDirector(
  mysqlClient: MySQLClient
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Directeurs --");
<<<<<<< HEAD
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
=======
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
>>>>>>> 2ce9cab (thread)
  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts

  const users = [];
  for (const raw of rawDirectors) {
=======

<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
  const advisors: UserEntity[] = [];

  for (const raw of rawAdvisors) {
=======
  const users = [];
  for (const raw of rawDirectors) {
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
>>>>>>> 2ce9cab (thread)
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) {
        console.warn(email);
        continue;
      }
<<<<<<< HEAD
=======
  for (const raw of rawDirectors) {
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) return;
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
=======
>>>>>>> 2ce9cab (thread)
      const passwordHash = await hasher.hash(raw.password);
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
<<<<<<< HEAD
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
=======
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
>>>>>>> 2ce9cab (thread)
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/03_director.ts
  return users;
=======
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
=======
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/01_advisor.ts
  return advisors;
=======
  return users;
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/03_director.ts
>>>>>>> 2ce9cab (thread)
}
