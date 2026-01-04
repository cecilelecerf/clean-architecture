import { MongoClient } from "../../MongoClient";
import { UserRepositoryMongo } from "../repositories/UserRepositoryMongo";
import { AccountRepositoryMongo } from "../repositories/AccountRepositoryMongo";
import { TransactionRepositoryMongo } from "../repositories/TransactionRepositoryMongo";
import { CreditRepositoryMongo } from "../repositories/CreditRepositoryMongo";
import { ThreadRepositoryMongo } from "../repositories/ThreadRepositoryMongo";
import { MessageRepositoryMongo } from "../repositories/MessageRepositoryMongo";
import { TagRepositoryMongo } from "../repositories/TagRepositoryMongo";
import { PostRepositoryMongo } from "../repositories/PostRepositoryMongo";
import { ActionRepositoryMongo } from "../repositories/ActionRepositoryMongo";
import { SavingsRateRepositoryMongo } from "../repositories/SavingsRateRepositoryMongo";
import { OrderRepositoryMongo } from "../repositories/OrderRepositoryMongo";
import { NotificationRepositoryMongo } from "../repositories/NotificationRepositoryMongo";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

// Use Cases (partagés entre MySQL et MongoDB)
import { SeedUserUseCase } from "@application/usecases/seeds/SeedUserRequest";
import { SeedAccountUseCase } from "@application/usecases/seeds/SeedAccountUseCase";
import { SeedTransactionUseCase } from "@application/usecases/seeds/SeedTransactionUseCase";
import { SeedCreditUseCase } from "@application/usecases/seeds/SeedCreditUseCase";
import { SeedThreadUseCase } from "@application/usecases/seeds/SeedThreadUseCase";
import { SeedMessageUseCase } from "@application/usecases/seeds/SeedMessageUseCase";
import { SeedTagUseCase } from "@application/usecases/seeds/SeedTagUseCase";
import { SeedPostUseCase } from "@application/usecases/seeds/SeedPostUseCase";
import { SeedActionUseCase } from "@application/usecases/seeds/SeedActionUseCase";
import { SeedSavingsRateUseCase } from "@application/usecases/seeds/SeedSavingsRateUseCase";
import { SeedOrderUseCase } from "@application/usecases/seeds/SeedOrderUseCase";
import { SeedNotificationUseCase } from "@application/usecases/seeds/SeedNotificationUseCase";
import { SeedBankAccountUseCase } from "@application/usecases/seeds/SeedBankAccountUseCase";

// Seed functions
import { seedAdvisor } from "../../seeds/02_seedAdvisor";
import { seedClient } from "../../seeds/03_seedClient";
import { seedDirector } from "../../seeds/01A_seedDirector";
import { generateExternalThreads } from "../../seeds/04_generateExternalThreads";
import { generateInternalThreads } from "../../seeds/05_generateInternalThreads";
import { generateTags } from "../../seeds/06_generateTags";
import { generatePosts } from "../../seeds/07_generatePosts";
import { generateActions } from "../../seeds/08_generateActions";
import { generateSavingsRate } from "../../seeds/10_generateSavingsRate";
import { generateOrders } from "../../seeds/11_generateOrders";
import { generateNotifications } from "../../seeds/12_generateNotifications";
import { generateBankAccounts } from "../../seeds/01B_generateBankAccounts";
import { FormuleCreditRepositoryMongo } from "../repositories/FormuleCreditRepositoryMongo";
import { generateFormuleCredits } from "../../seeds/01C_generateFormulesCredit";
import { SeedFormuleCreditUseCase } from "@application/usecases/seeds/SeedFormuleCreditUseCase";

const all = async () => {
  console.log("🌱 Starting MongoDB seed...\n");

  // 1. Initialiser le client MongoDB
  const mongoClient = new MongoClient();

  const userRepository = new UserRepositoryMongo(mongoClient);
  const accountRepository = new AccountRepositoryMongo(mongoClient);
  const transactionRepository = new TransactionRepositoryMongo(mongoClient);
  const creditRepository = new CreditRepositoryMongo(mongoClient);
  const threadRepository = new ThreadRepositoryMongo(mongoClient);
  const messageRepository = new MessageRepositoryMongo(mongoClient);
  const tagRepository = new TagRepositoryMongo(mongoClient);
  const postRepository = new PostRepositoryMongo(mongoClient);
  const actionRepository = new ActionRepositoryMongo(mongoClient);
  const savingsRateRepository = new SavingsRateRepositoryMongo(mongoClient);
  const orderRepository = new OrderRepositoryMongo(mongoClient);
  const notificationRepository = new NotificationRepositoryMongo(mongoClient);
  const formuleRepository = new FormuleCreditRepositoryMongo(mongoClient);

  const encryptionService = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  const seedUserUseCase = new SeedUserUseCase(
    userRepository,
    encryptionService,
    uuidService,
    clockService
  );

  const seedAccountUseCase = new SeedAccountUseCase(
    accountRepository,
    clockService
  );

  const seedTransactionUseCase = new SeedTransactionUseCase(
    transactionRepository,
    uuidService,
    clockService
  );

  const seedCreditUseCase = new SeedCreditUseCase(
    creditRepository,
    formuleRepository,
    accountRepository,
    uuidService,
    clockService
  );

  const seedThreadUseCase = new SeedThreadUseCase(
    threadRepository,
    uuidService,
    clockService
  );

  const seedMessageUseCase = new SeedMessageUseCase(
    messageRepository,
    uuidService,
    clockService
  );

  const seedTagUseCase = new SeedTagUseCase(
    tagRepository,
    uuidService,
    clockService
  );

  const seedPostUseCase = new SeedPostUseCase(
    postRepository,
    uuidService,
    clockService
  );

  const seedActionUseCase = new SeedActionUseCase(
    actionRepository,
    clockService
  );

  const seedSavingsRateUseCase = new SeedSavingsRateUseCase(
    savingsRateRepository,
    uuidService,
    clockService
  );

  const seedOrderUseCase = new SeedOrderUseCase(
    orderRepository,
    uuidService,
    clockService
  );

  const seedNotificationUseCase = new SeedNotificationUseCase(
    notificationRepository,
    uuidService,
    clockService
  );

  const seedBankAccountUseCase = new SeedBankAccountUseCase(
    accountRepository,
    clockService
  );

  const seedFormuleCreditUseCase = new SeedFormuleCreditUseCase(
    formuleRepository,
    uuidService,
    clockService
  );

  // 5. Exécuter les seeds
  const directors = await seedDirector(seedUserUseCase, clockService);

  const bankAccounts = await generateBankAccounts(seedBankAccountUseCase);
  const formuleCredits = await generateFormuleCredits(
    bankAccounts.map(({ iban }) => iban),
    seedFormuleCreditUseCase
  );
  const advisors = await seedAdvisor(seedUserUseCase, clockService);

  const clients = await seedClient(
    seedUserUseCase,
    seedAccountUseCase,
    seedTransactionUseCase,
    seedCreditUseCase,
    clockService,
    formuleCredits
  );

  await generateExternalThreads(
    clients,
    advisors,
    seedThreadUseCase,
    seedMessageUseCase,
    clockService
  );

  await generateInternalThreads(
    directors,
    advisors,
    seedThreadUseCase,
    seedMessageUseCase,
    clockService,
    {
      threadsCount: 15,
      minAdminsPerThread: 2,
      maxAdminsPerThread: 5,
      minMessages: 4,
      maxMessages: 12,
    }
  );

  const tags = await generateTags(seedTagUseCase, clockService);

  await generatePosts(
    advisors,
    directors,
    clients,
    tags,
    seedPostUseCase,
    clockService
  );

  const actions = await generateActions(seedActionUseCase);

  await generateSavingsRate(seedSavingsRateUseCase);

  await generateOrders(clients, actions, seedOrderUseCase, clockService);

  await generateNotifications(
    advisors,
    clients,
    seedNotificationUseCase,
    clockService
  );

  await generateBankAccounts(seedBankAccountUseCase);
};

all()
  .then(() => {
    console.log("\n🎉 MongoDB seed process completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 MongoDB seed process failed:", error);
    process.exit(1);
  });
