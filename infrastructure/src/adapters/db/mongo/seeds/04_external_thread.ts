import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/ThreadRepositoryMongo";
import { MessageRepositoryMongo } from "@infrastructure/adapters/db/mongo/repositories/MessageRepositoryMongo";
import { MongoClient } from "../../MongoClient";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { pick, rand } from "./utils";

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

export const generateExternalThreadsMongo = async (
  clients: UserEntity[],
  advisors: UserEntity[],
  mongoClient: MongoClient,
  opts?: {
    threadsCount?: number;
    minMessages?: number;
    maxMessages?: number;
  }
): Promise<{ threads: ThreadEntity[]; messages: MessageEntity[] }> => {
  console.log("-- Generation des threads externes (Mongo) --");

  await mongoClient.connect();

  const threadRepository = new ThreadRepositoryMongo(mongoClient);
  const messageRepository = new MessageRepositoryMongo(mongoClient);
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
      updatedAt: lastUpdatedAt,
      isClose: Math.random() < 0.2,
      type: "external",
    });

    threads.push(thread);
    await threadRepository.save(thread);
    console.log(thread.id);

    let currentTime = createdAt;
    const msgCount = rand(minMessages, maxMessages);

    for (let m = 0; m < msgCount; m++) {
      currentTime = clockService.addMinutes(
        currentTime,
        rand(30, 60 * 24 * 2)
      );

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
