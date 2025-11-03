import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { PostRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/PostRepositoryMySQL";
import { TagEntity } from "@domain/entities/TagEntity";
import { PostEntity } from "@domain/entities/PostEntity";
import { UserEntity } from "@domain/entities/UserEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const titles = [
  "Nouvelle fonctionnalité en ligne",
  "Mise à jour de sécurité",
  "Conseils pour mieux gérer vos comptes",
  "Nos bureaux seront fermés lundi",
  "Découvrez notre nouveau service client",
  "Améliorations de l’application mobile",
  "Participez à notre enquête de satisfaction",
  "Information importante sur vos relevés bancaires",
];

const contents = [
  "Nous avons déployé une nouvelle mise à jour avec plusieurs correctifs et améliorations.",
  "Pour renforcer la sécurité, nous vous recommandons d’activer l’authentification à deux facteurs.",
  "Merci de votre fidélité ! Nous travaillons chaque jour pour améliorer votre expérience.",
  "Notre équipe reste à votre disposition pour toute question ou suggestion.",
  "Retrouvez tous les détails sur notre site officiel.",
];

/**
 * Génère des posts publiés par des administrateurs et directeurs.
 * Garantit qu'au moins le premier advisor et le premier director ont chacun un post.
 */
export const generatePosts = async (
  advisors: UserEntity[],
  directors: UserEntity[],
  tags: TagEntity[],
  mySqlClient: MySQLClient,
  opts?: {
    postsCount?: number;
    minTagsPerPost?: number;
    maxTagsPerPost?: number;
  }
): Promise<PostEntity[]> => {
  console.log("-- Création des posts --");

  const postRepository = new PostRepositoryMySQL(mySqlClient);
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

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

  const createPost = async (author: UserEntity) => {
    const createdAt = clockService.nowMinusDays(rand(0, 60));
    const modifiedAt =
      Math.random() < 0.3
        ? clockService.addDays(createdAt, rand(1, 10))
        : undefined;
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

    const post = PostEntity.from({
      id: uuidService.generate(),
      advisorId: author.id,
      title: pick(titles),
      content: pick(contents),
      tagsId: tagsForPost,
      createdAt,
      modifiedAt,
      publishedAt,
      readBy: [],
    });

    posts.push(post);
    await postRepository.save(post);
    console.log(post.id);
  };

  // 🟩 Post garanti pour le premier director
  await createPost(directors[0]);

  // 🟩 Post garanti pour le premier advisor
  await createPost(advisors[0]);

  // 🔁 Posts aléatoires supplémentaires
  const remainingCount = Math.max(0, postsCount - 2);
  for (let i = 0; i < remainingCount; i++) {
    await createPost(pick(authors));
  }

  return posts;
};
