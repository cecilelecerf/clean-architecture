import { MessageEntity } from "@domain/entities/MessageEntity";
import { pick, rand } from "./utils";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { UserEntity } from "@domain/entities/UserEntity";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";
import { MySQLClient } from "../../MySQLClient";
import { MessageRepositoryMySQL } from "../repositories/MessageRepositoryMySQL";
import { ThreadRepositoryMySQL } from "../repositories/ThreadRepositoryMySQL";
const loremExternal = [
  "Bonjour, j'aimerais ouvrir un compte épargne.",
  "Quels sont les taux actuels pour un prêt immobilier ?",
  "Je souhaite modifier mon plafond de carte bancaire.",
  "Pouvez-vous m'expliquer les frais de tenue de compte ?",
  "Merci pour votre aide, c'est très clair.",
  "J'ai reçu votre email, je regarde ça.",
  "Parfait, merci beaucoup pour ces informations.",
  "Quand puis-je passer en agence ?",
];

const titlesExternal = [
  "Demande d'information",
  "Ouverture de compte",
  "Question sur mon prêt",
  "Assistance carte bancaire",
  "Rendez-vous en agence",
  "Modification de contrat",
];
export const generateExternalThreads = async (
  conseillers: UserEntity[],
  clients: UserEntity[],
  mySqlClient: MySQLClient,
  opts?: {
    threadsCount?: number;
    minMessages?: number;
    maxMessages?: number;
  }
): Promise<{ threads: ThreadEntity[]; messages: MessageEntity[] }> => {
  console.log("-- Génération des threads externes --");

  const threadRepository = new ThreadRepositoryMySQL(mySqlClient);
  const messageRepository = new MessageRepositoryMySQL(mySqlClient);
  const clockService = new SystemClockService();
  const uuidService = new NodeUuidService();

  if (!conseillers.length || !clients.length) {
    throw new Error("Tu dois fournir au moins un conseiller et un client.");
  }

  const {
    threadsCount = Math.min(conseillers.length * 2, clients.length),
    minMessages = 3,
    maxMessages = 10,
  } = opts ?? {};

  const threads: ThreadEntity[] = [];
  const messages: MessageEntity[] = [];

  const client0 = clients[0]; // Client à l'index 0
  const conseiller0 = conseillers[0]; // Conseiller à l'index 0

  // ✅ 1. Thread NORMAL pour client[0] avec conseiller[0]
  console.log(`📌 Création thread NORMAL pour ${client0.id}`);
  const threadNormal = await createExternalThread({
    client: client0,
    conseiller: conseiller0,
    status: "normal",
    threadRepository,
    messageRepository,
    clockService,
    uuidService,
    minMessages,
    maxMessages,
  });
  threads.push(threadNormal.thread);
  messages.push(...threadNormal.messages);

  // ✅ 2. Thread SANS ADMIN pour client[0]
  console.log(`📌 Création thread SANS ADMIN pour ${client0.id}`);
  const threadNoAdmin = await createExternalThread({
    client: client0,
    conseiller: null,
    status: "no-admin",
    threadRepository,
    messageRepository,
    clockService,
    uuidService,
    minMessages,
    maxMessages,
  });
  threads.push(threadNoAdmin.thread);
  messages.push(...threadNoAdmin.messages);

  // ✅ 3. Thread FERMÉ pour client[0] avec conseiller[0]
  console.log(`📌 Création thread FERMÉ pour ${client0.id}`);
  const threadClosed = await createExternalThread({
    client: client0,
    conseiller: conseiller0,
    status: "closed",
    threadRepository,
    messageRepository,
    clockService,
    uuidService,
    minMessages,
    maxMessages,
  });
  threads.push(threadClosed.thread);
  messages.push(...threadClosed.messages);

  // ✅ 4. Au moins 1 autre thread pour conseiller[0] avec un autre client
  console.log(
    `📌 Création thread supplémentaire pour conseiller ${conseiller0.id}`
  );
  const otherClient = clients.length > 1 ? clients[1] : client0;
  const threadForConseiller = await createExternalThread({
    client: otherClient,
    conseiller: conseiller0,
    status: "normal",
    threadRepository,
    messageRepository,
    clockService,
    uuidService,
    minMessages,
    maxMessages,
  });
  threads.push(threadForConseiller.thread);
  messages.push(...threadForConseiller.messages);

  // ✅ 5. Génération des threads aléatoires restants
  const remainingThreadsCount = Math.max(0, threadsCount - 4);
  console.log(`📌 Création de ${remainingThreadsCount} threads aléatoires`);

  for (let i = 0; i < remainingThreadsCount; i++) {
    const client = pick(clients);
    const conseiller = Math.random() < 0.8 ? pick(conseillers) : null;
    const status = conseiller
      ? Math.random() < 0.9
        ? "normal"
        : "closed"
      : "no-admin";

    const randomThread = await createExternalThread({
      client,
      conseiller,
      status,
      threadRepository,
      messageRepository,
      clockService,
      uuidService,
      minMessages,
      maxMessages,
    });

    threads.push(randomThread.thread);
    messages.push(...randomThread.messages);
  }

  console.log(`✅ ${threads.length} threads externes créés`);
  return { threads, messages };
};

/**
 * Helper pour créer un thread externe avec messages
 */
async function createExternalThread({
  client,
  conseiller,
  status,
  threadRepository,
  messageRepository,
  clockService,
  uuidService,
  minMessages,
  maxMessages,
}: {
  client: UserEntity;
  conseiller: UserEntity | null;
  status: "normal" | "no-admin" | "closed";
  threadRepository: ThreadRepositoryMySQL;
  messageRepository: MessageRepositoryMySQL;
  clockService: SystemClockService;
  uuidService: NodeUuidService;
  minMessages: number;
  maxMessages: number;
}): Promise<{ thread: ThreadEntity; messages: MessageEntity[] }> {
  const createdAt = clockService.nowMinusDays(rand(1, 60));
  const lastUpdatedAt = clockService.addDays(createdAt, rand(0, 15));

  const thread = ThreadEntity.from({
    id: uuidService.generate(),
    administratorId: conseiller?.id ?? null,
    participantsId: [client.id],
    title: pick(titlesExternal),
    createdAt,
    updatedAt: lastUpdatedAt,
    isClose: status === "closed",
    type: "external",
  });

  await threadRepository.save(thread);
  console.log(
    `  Thread ${status.toUpperCase()}: ${thread.id} (client: ${
      client.id
    }, conseiller: ${conseiller?.id ?? "NONE"})`
  );

  const messages: MessageEntity[] = [];
  const msgCount = rand(minMessages, maxMessages);
  let currentTime = new Date(createdAt);

  for (let m = 0; m < msgCount; m++) {
    currentTime = clockService.addMinutes(currentTime, rand(30, 1800));

    // Alternance client / conseiller (si conseiller existe)
    const sender = conseiller && m % 2 === 1 ? conseiller : client;

    const readBy: string[] = [];
    if (conseiller && Math.random() < 0.7) {
      readBy.push(conseiller.id);
    }
    if (Math.random() < 0.6) {
      readBy.push(client.id);
    }

    const msg = MessageEntity.from({
      id: uuidService.generate(),
      threadId: thread.id,
      senderId: sender.id,
      content: pick(loremExternal),
      sentAt: currentTime,
      readBy: Array.from(new Set(readBy)),
    });

    messages.push(msg);
    await messageRepository.save(msg);
  }

  return { thread, messages };
}
