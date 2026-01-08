import { UserEntity } from "@domain/entities/UserEntity";
import { rawAdvisors } from "./raw/advisors";
import { rand } from "./utils";
import { SeedUserUseCase } from "@application/usecases/seeds/SeedUserRequest";
import { ClockService } from "@application/ports/services/ClockService";

export async function seedAdvisor(
  seedUserUseCase: SeedUserUseCase,
  clockService: ClockService
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Conseillers --");

  const advisors: UserEntity[] = [];

  for (const raw of rawAdvisors) {
    try {
      const now = clockService.now();

      const user = await seedUserUseCase.execute({
        email: raw.email,
        password: raw.password,
        firstName: raw.firstname,
        lastName: raw.lastname,
        // phoneNumber: raw.phoneNumber,
        role: "conseiller",
        createdAt: now,
        confirmedAt: now,
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(now, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
        isActiveField: true,
      });

      advisors.push(user);
      console.log(`✅ Advisor created: ${user.email.value}`);
    } catch (err) {
      console.error(`❌ Failed to create advisor ${raw.email}:`, err);
    }
  }

  console.log(`✅ Advisors seed completed: ${advisors.length} created\n`);
  return advisors;
}
