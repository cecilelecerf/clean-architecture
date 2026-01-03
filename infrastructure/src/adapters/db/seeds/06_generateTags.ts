import { TagEntity } from "@domain/entities/TagEntity";
import { rand } from "./utils";
import { SeedTagUseCase } from "@application/usecases/seeds/SeedTagUseCase";
import { ClockService } from "@application/ports/services/ClockService";
import { rawTags } from "./raw/tags";

/**
 * Génère une liste de tags prédéfinis et les enregistre dans la base.
 */
export const generateTags = async (
  seedTagUseCase: SeedTagUseCase,
  clockService: ClockService
): Promise<TagEntity[]> => {
  console.log("-- Création des tags --");

  const now = clockService.now();
  const tags: TagEntity[] = [];

  for (const raw of rawTags) {
    try {
      const tag = await seedTagUseCase.execute({
        label: raw.label,
        color: raw.color,
        createdAt: now,
        updatedAt:
          Math.random() < 0.3
            ? clockService.addDays(now, rand(1, 10))
            : clockService.nowMinusDays(rand(0, 60)),
      });

      tags.push(tag);
      console.log(`  ✅ Tag created: ${tag.label} (${tag.id})`);
    } catch (err) {
      console.warn(`  ⚠️  Failed to create tag ${raw.label}:`, err);
    }
  }

  console.log(`✅ Tags seed completed: ${tags.length} created\n`);
  return tags;
};
