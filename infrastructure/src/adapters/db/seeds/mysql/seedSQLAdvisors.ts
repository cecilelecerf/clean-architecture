import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { UserRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/UserRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { rawAdvisors } from "../raws/advisors";

export async function seedSQLAdministrator() {
  const mysqlClient = new MySQLClient();
  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const hasher = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();
  for (const raw of rawAdvisors) {
    try {
      const email = Email.create(raw.email);
      if (email instanceof Error) return;
      const passwordHash = await hasher.hash(raw.password);
      const user = UserEntity.from({
        ...raw,
        email,
        passwordHash,
        id: uuidService.generate(),
        role: "conseiller",
        createdAt: clockService.now(),
        isActiveField: true,
      });

      userRepository.save(user);
    } catch (err) {
      console.error(`Skipping user ${raw.email} – invalid email:`, err);
    }
  }
}
