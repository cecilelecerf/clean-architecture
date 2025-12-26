import { UserEntity } from "@domain/entities/UserEntity";
import { rawDirectors } from "./raw/director";
import { rand } from "./utils";
import { SeedUserUseCase } from "@application/usecases/seeds/SeedUserRequest";
import { ClockService } from "@application/ports/services/ClockService";

export async function seedDirector(
  seedUserUseCase: SeedUserUseCase,
  clockService: ClockService
): Promise<UserEntity[]> {
  console.log("-- Création des comptes Directeurs --");

  const directors: UserEntity[] = [];

  for (const raw of rawDirectors) {
    try {
      const now = clockService.now();

      const user = await seedUserUseCase.execute({
        email: raw.email,
        password: raw.password,
        firstName: raw.firstname,
        lastName: raw.lastname,
        // phoneNumber: raw.phoneNumber,
        role: "directeur",
        createdAt: now,
        confirmedAt: now,
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(now, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
        isActiveField: true,
      });

      directors.push(user);
      console.log(`✅ Director created: ${user.email.value}`);
    } catch (err) {
      console.error(`❌ Failed to create director ${raw.email}:`, err);
    }
  }

  console.log(`✅ Directors seed completed: ${directors.length} created\n`);
  return directors;
}
