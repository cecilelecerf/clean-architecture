import { UserEntity } from "@domain/entities/UserEntity";
import { ThreadEntity } from "@domain/entities/ThreadEntity";
import { MessageEntity } from "@domain/entities/MessageEntity";
import { SeedThreadUseCase } from "@application/usecases/seeds/SeedThreadUseCase";
import { SeedMessageUseCase } from "@application/usecases/seeds/SeedMessageUseCase";
import { ClockService } from "@application/ports/services/ClockService";
import { pick, rand } from "./utils";

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

interface ExternalThreadOptions {
  threadsCount?: number;
  minMessages?: number;
  maxMessages?: number;
}

export const generateExternalThreads = async (
  conseillers: UserEntity[],
  clients: UserEntity[],
  seedThreadUseCase: SeedThreadUseCase,
  seedMessageUseCase: SeedMessageUseCase,
  clockService: ClockService,
  opts?: ExternalThreadOptions
): Promise<{ threads: ThreadEntity[]; messages: MessageEntity[] }> => {
  console.log("-- Génération des threads externes --");

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

  const client0 = clients[0];
  const conseiller0 = conseillers[0];

  // 1. Thread NORMAL pour client[0] avec conseiller[0]
  console.log(`📌 Création thread NORMAL pour ${client0.id}`);
  const threadNormal = await createExternalThread({
    client: client0,
    conseiller: conseiller0,
    status: "normal",
    seedThreadUseCase,
    seedMessageUseCase,
    clockService,
    minMessages,
    maxMessages,
  });
  threads.push(threadNormal.thread);
  messages.push(...threadNormal.messages);

  // 2. Thread SANS ADMIN pour client[0]
  console.log(`📌 Création thread SANS ADMIN pour ${client0.id}`);
  const threadNoAdmin = await createExternalThread({
    client: client0,
    conseiller: null,
    status: "no-admin",
    seedThreadUseCase,
    seedMessageUseCase,
    clockService,
    minMessages,
    maxMessages,
  });
  threads.push(threadNoAdmin.thread);
  messages.push(...threadNoAdmin.messages);

  // 3. Thread FERMÉ pour client[0] avec conseiller[0]
  console.log(`📌 Création thread FERMÉ pour ${client0.id}`);
  const threadClosed = await createExternalThread({
    client: client0,
    conseiller: conseiller0,
    status: "closed",
    seedThreadUseCase,
    seedMessageUseCase,
    clockService,
    minMessages,
    maxMessages,
  });
  threads.push(threadClosed.thread);
  messages.push(...threadClosed.messages);

  // 4. Au moins 1 autre thread pour conseiller[0]
  console.log(
    `📌 Création thread supplémentaire pour conseiller ${conseiller0.id}`
  );
  const otherClient = clients.length > 1 ? clients[1] : client0;
  const threadForConseiller = await createExternalThread({
    client: otherClient,
    conseiller: conseiller0,
    status: "normal",
    seedThreadUseCase,
    seedMessageUseCase,
    clockService,
    minMessages,
    maxMessages,
  });
  threads.push(threadForConseiller.thread);
  messages.push(...threadForConseiller.messages);

  // 5. Threads aléatoires restants
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
      seedThreadUseCase,
      seedMessageUseCase,
      clockService,
      minMessages,
      maxMessages,
    });

    threads.push(randomThread.thread);
    messages.push(...randomThread.messages);
  }

  console.log(`✅ ${threads.length} threads externes créés\n`);
  return { threads, messages };
};

/**
 * Helper pour créer un thread externe avec messages
 */
async function createExternalThread({
  client,
  conseiller,
  status,
  seedThreadUseCase,
  seedMessageUseCase,
  clockService,
  minMessages,
  maxMessages,
}: {
  client: UserEntity;
  conseiller: UserEntity | null;
  status: "normal" | "no-admin" | "closed";
  seedThreadUseCase: SeedThreadUseCase;
  seedMessageUseCase: SeedMessageUseCase;
  clockService: ClockService;
  minMessages: number;
  maxMessages: number;
}): Promise<{ thread: ThreadEntity; messages: MessageEntity[] }> {
  const createdAt = clockService.nowMinusDays(rand(1, 60));
  const lastUpdatedAt = clockService.addDays(createdAt, rand(0, 15));

  // Créer le thread via use case
  const thread = await seedThreadUseCase.execute({
    administratorId: conseiller?.id ?? null,
    participantsId: [client.id],
    title: pick(titlesExternal),
    type: "external",
    isClose: status === "closed",
    createdAt,
    updatedAt: lastUpdatedAt,
  });

  console.log(
    `  Thread ${status.toUpperCase()}: ${thread.id} (client: ${
      client.id
    }, conseiller: ${conseiller?.id ?? "NONE"})`
  );

  // Créer les messages
  const messages: MessageEntity[] = [];
  const msgCount = rand(minMessages, maxMessages);
  let currentTime = new Date(createdAt);

  for (let m = 0; m < msgCount; m++) {
    currentTime = clockService.addMinutes(currentTime, rand(30, 1800));

    // Alternance client / conseiller
    const sender = conseiller && m % 2 === 1 ? conseiller : client;

    // Déterminer qui a lu le message
    const readBy: string[] = [];
    if (conseiller && Math.random() < 0.7) {
      readBy.push(conseiller.id);
    }
    if (Math.random() < 0.6) {
      readBy.push(client.id);
    }

    const message = await seedMessageUseCase.execute({
      threadId: thread.id,
      senderId: sender.id,
      content: pick(loremExternal),
      sentAt: currentTime,
      readBy: Array.from(new Set(readBy)),
    });

    messages.push(message);
  }

  return { thread, messages };
}
