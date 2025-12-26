import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import { MessageRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/MessageRepositoryMySQL";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { MySQLClient } from "@infrastructure/adapters/db/MySQLClient";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { UserEntity } from "@domain/entities/UserEntity";
import { pick, rand } from "./utils";

const lorem = [
  "Merci pour la mise à jour du rapport.",
  "On doit revoir la stratégie avant la fin du mois.",
  "Peux-tu valider le dernier document RH ?",
  "Je pense qu'on doit ajuster la communication.",
  "Bonne idée, on met ça en place dès lundi.",
  "Je valide la proposition, allons-y.",
  "On se retrouve demain pour en discuter.",
  "Je t'envoie les chiffres dès que possible.",
];

const titlesInternal = [
  "Réunion interne",
  "Organisation mensuelle",
  "Mise à jour du service",
  "Suivi d'équipe",
  "Communication interne",
];

/**
 * Génère des threads internes (directeur ↔ administrateurs)
 */
export const generateInternalThreads = async (
  directors: UserEntity[],
  administrators: UserEntity[],
  mySqlClient: MySQLClient,
  opts?: {
    threadsCount?: number;
    minAdminsPerThread?: number;
    maxAdminsPerThread?: number;
    minMessages?: number;
    maxMessages?: number;
  }
): Promise<{ threads: ThreadEntity[]; messages: MessageEntity[] }> => {
  console.log("-- Génération des threads internes --");

  const threadRepository = new ThreadRepositoryMySQL(mySqlClient);
  const messageRepository = new MessageRepositoryMySQL(mySqlClient);
  const clockService = new SystemClockService();
  const uuidService = new NodeUuidService();

  if (!directors.length || !administrators.length) {
    throw new Error(
      "Tu dois fournir au moins un directeur et un administrateur."
    );
  }

  const {
    threadsCount = Math.min(directors.length, administrators.length),
    minAdminsPerThread = 2,
    maxAdminsPerThread = 5,
    minMessages = 4,
    maxMessages = 12,
  } = opts ?? {};

  const threads: ThreadEntity[] = [];
  const messages: MessageEntity[] = [];

  for (let i = 0; i < threadsCount; i++) {
    const director = pick(directors);

    const adminsInThread = Array.from(
      new Set(
        Array.from(
          { length: rand(minAdminsPerThread, maxAdminsPerThread) },
          () => pick(administrators)
        ).map((a) => a.id)
      )
    );

    const createdAt = clockService.nowMinusDays(rand(1, 30));
    const lastUpdatedAt = clockService.addDays(createdAt, rand(0, 10));

    const thread = ThreadEntity.from({
      id: uuidService.generate(),
      administratorId: director.id,
      participantsId: adminsInThread,
      title: pick(titlesInternal),
      createdAt,
      updatedAt: lastUpdatedAt,
      isClose: Math.random() < 0.1,
      type: "internal",
    });
    threads.push(thread);
    await threadRepository.save(thread);
    console.log(`Thread interne créé: ${thread.id}`);

    let currentTime = new Date(createdAt);
    const msgCount = rand(minMessages, maxMessages);

    for (let m = 0; m < msgCount; m++) {
      currentTime = clockService.addMinutes(currentTime, rand(30, 1800));

      const sender =
        m % 2 === 0
          ? director
          : pick(administrators.filter((a) => adminsInThread.includes(a.id)));

      const readBy = adminsInThread.filter(() => Math.random() < 0.8);

      const msg = MessageEntity.from({
        id: uuidService.generate(),
        threadId: thread.id,
        senderId: sender.id,
        content: pick(lorem),
        sentAt: currentTime,
        readBy: Array.from(new Set([director.id, ...readBy])),
      });

      messages.push(msg);
      await messageRepository.save(msg);
    }
  }

  return { threads, messages };
};
