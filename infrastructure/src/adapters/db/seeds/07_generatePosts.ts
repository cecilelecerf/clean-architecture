import { TagEntity } from "@domain/entities/TagEntity";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { SeedPostUseCase } from "@application/usecases/seeds/SeedPostUseCase";
import { ClockService } from "@application/ports/services/ClockService";
import { pick, rand } from "./utils";

const titles = [
  "Nouvelle fonctionnalité en ligne",
  "Mise à jour de sécurité",
  "Conseils pour mieux gérer vos comptes",
  "Nos bureaux seront fermés lundi",
  "Découvrez notre nouveau service client",
  "Améliorations de l'application mobile",
  "Participez à notre enquête de satisfaction",
  "Information importante sur vos relevés bancaires",
];

const contents = [
  "Nous avons déployé une nouvelle mise à jour avec plusieurs correctifs et améliorations.",
  "Pour renforcer la sécurité, nous vous recommandons d'activer l'authentification à deux facteurs.",
  "Merci de votre fidélité ! Nous travaillons chaque jour pour améliorer votre expérience.",
  "Notre équipe reste à votre disposition pour toute question ou suggestion.",
  "Retrouvez tous les détails sur notre site officiel.",
];

interface PostOptions {
  postsCount?: number;
  minTagsPerPost?: number;
  maxTagsPerPost?: number;
}

/**
 * Génère des posts publiés par des administrateurs et directeurs.
 * Garantit qu'au moins le premier advisor et le premier director ont chacun un post.
 */
export const generatePosts = async (
  advisors: UserEntity[],
  directors: UserEntity[],
  clients: UserEntity[],
  tags: TagEntity[],
  seedPostUseCase: SeedPostUseCase,
  clockService: ClockService,
  opts?: PostOptions
): Promise<PostEntity[]> => {
  console.log("-- Création des posts --");

  if (!advisors.length || !directors.length) {
    throw new Error("Tu dois fournir au moins un advisor et un director.");
  }

  if (!tags.length) {
    throw new Error("Tu dois fournir au moins un tag.");
  }

  const {
    postsCount = 15,
    minTagsPerPost = 1,
    maxTagsPerPost = 3,
  } = opts ?? {};

  const authors = [...advisors, ...directors];
  const posts: PostEntity[] = [];

  // Helper pour créer un post
  const createPost = async (
    author: UserEntity,
    client?: UserEntity,
    defineReadBy?: UserEntity
  ): Promise<void> => {
    try {
      const createdAt = clockService.nowMinusDays(rand(0, 60));
      const updatedAt =
        Math.random() < 0.3
          ? clockService.addDays(createdAt, rand(1, 10))
          : clockService.nowMinusDays(rand(0, 60));
      const publishedAt =
        Math.random() < 0.9
          ? clockService.addDays(createdAt, rand(0, 3))
          : undefined;

      const tagsForPost = Array.from(
        new Set(
          Array.from(
            { length: rand(minTagsPerPost, maxTagsPerPost) },
            () => pick(tags).id
          )
        )
      );

      const readBy: string[] = [];

      if (defineReadBy) {
        readBy.push(defineReadBy.id);
      } else if (client) {
        if (rand(0, 1) === 0) {
          readBy.push(client.id);
        }
      } else {
        const readers = Array.from(
          new Set(
            Array.from(
              { length: rand(0, Math.min(10, clients.length)) },
              () => pick(clients).id
            )
          )
        );
        readBy.push(...readers);
      }

      const post = await seedPostUseCase.execute({
        advisorId: author.id,
        title: pick(titles),
        content: pick(contents),
        tagsId: tagsForPost,
        clientId: client?.id,
        readBy,
        createdAt,
        updatedAt,
        publishedAt,
      });

      posts.push(post);
      console.log(`  ✅ Post created: ${post.title} (${post.id})`);
    } catch (err) {
      console.warn(`  ⚠️  Failed to create post:`, err);
    }
  };

  console.log("📌 Création posts pour director[0]");
  await createPost(directors[0], clients[0], clients[0]);
  await createPost(directors[0]);

  console.log("📌 Création posts pour advisor[0]");
  await createPost(advisors[0], clients[0]);
  await createPost(advisors[0]);

  const remainingCount = Math.max(0, postsCount - 4);
  console.log(`📌 Création de ${remainingCount} posts aléatoires`);

  for (let i = 0; i < remainingCount; i++) {
    if (i % 2 === 0) {
      await createPost(pick(authors));
    } else {
      await createPost(pick(authors), pick(clients));
    }
  }

  console.log(`✅ Posts seed completed: ${posts.length} created\n`);
  return posts;
};
