import { UserEntity } from "@domain/entities/UserEntity";
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/04_external_thread.ts
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/ThreadRepositoryMySQL";
import crypto from "crypto";
import { MySQLClient } from "../../MySQLClient";
import { MessageRepositoryMySQL } from "@infrastructure/adapters/db/mysql/repositories/MessageRepositoryMySQL";
=======
import { ThreadRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/ThreadRepositoryMySQL";
import crypto from "crypto";
import { MySQLClient } from "../../MySQLClient";
import { MessageRepositoryMySQL } from "@infrastructure/adapters/repositories/mysql/MessageRepositoryMySQL";
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/04_external_thread.ts
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/04_external_thread.ts
import { pick, rand } from "./utils";
=======

// helpers
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/04_external_thread.ts

const lorem = [
  "Bonjour, j’ai une question concernant mon compte.",
  "Merci pour votre réponse rapide !",
  "Pouvez-vous m’expliquer le dernier prélèvement ?",
  "D’accord, je vois mieux maintenant.",
  "Je vous envoie les documents dès que possible.",
  "Bonne journée et merci pour votre aide.",
  "Je viens de recevoir la notification.",
  "Est-ce que tout est en ordre maintenant ?",
];

const titles = [
  "Suivi client",
  "Demande d’information",
  "Assistance bancaire",
  "Vérification de compte",
  "Mise à jour du dossier",
];

/**
 * Génère des threads 1-to-1 entre clients et advisors.
 * @param clients tableau d'userId des clients
 * @param advisors tableau d'userId des advisors
 * @param opts options : nb de threads, messages par thread
 */
export const generateExternalThreads = async (
  clients: UserEntity[],
  advisors: UserEntity[],
  mySqlClient: MySQLClient,
  opts?: {
    threadsCount?: number;
    minMessages?: number;
    maxMessages?: number;
  }
): Promise<{ threads: ThreadEntity[]; messages: MessageEntity[] }> => {
  console.log("-- Generation des threads externes --");
  const threadRepository = new ThreadRepositoryMySQL(mySqlClient);
  const messageRepository = new MessageRepositoryMySQL(mySqlClient);
  const clockService = new SystemClockService();
  const uuidService = new NodeUuidService();

  if (!clients.length || !advisors.length) {
    throw new Error("Tu dois fournir au moins un client et un advisor.");
  }

  const {
    threadsCount = Math.min(clients.length, advisors.length),
    minMessages = 3,
    maxMessages = 10,
  } = opts ?? {};

  const threads: ThreadEntity[] = [];
  const messages: MessageEntity[] = [];

  for (let i = 0; i < threadsCount; i++) {
    const client = pick(clients);
    const advisor = pick(advisors);

    const createdAt = clockService.nowMinusDays(rand(0, 30));
    const lastUpdatedAt = clockService.addDays(createdAt, rand(0, 10));

    const thread = ThreadEntity.from({
      id: uuidService.generate(),
      administratorId: advisor.id,
      participantsId: [client.id],
      title: pick(titles),
      createdAt,
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/04_external_thread.ts
      updatedAt: lastUpdatedAt,
=======
      lastUpdatedAt,
>>>>>>> 20507fa (generate thread and posts):infrastructure/src/adapters/db/seeds/mysql/04_external_thread.ts
      isClose: Math.random() < 0.2,
      type: "external",
    });

    threads.push(thread);
    await threadRepository.save(thread);
    console.log(thread.id);

    let currentTime = createdAt;
    const msgCount = rand(minMessages, maxMessages);

    for (let m = 0; m < msgCount; m++) {
      currentTime = clockService.addMinutes(currentTime, rand(30, 60 * 24 * 2));

      const sender = m % 2 === 0 ? client : advisor;
      const readBy = [sender.id];

      const msg = MessageEntity.from({
        id: uuidService.generate(),
        threadId: thread.id,
        senderId: sender.id,
        content: pick(lorem),
        sentAt: currentTime,
        readBy,
      });

      messages.push(msg);
      await messageRepository.save(msg);
    }
  }

  return { threads, messages };
};
