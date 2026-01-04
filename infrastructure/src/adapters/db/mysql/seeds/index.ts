import { MySQLClient } from "../../MySQLClient";
import { UserRepositoryMySQL } from "../repositories/UserRepositoryMySQL";
import { AccountRepositoryMySQL } from "../repositories/AccountRepositoryMysql";
import { TransactionRepositoryMySQL } from "../repositories/TransactionRepositoryMySQL";
import { CreditRepositoryMySQL } from "../repositories/CreditRepositoryMySQL";
import { ThreadRepositoryMySQL } from "../repositories/ThreadRepositoryMySQL";
import { MessageRepositoryMySQL } from "../repositories/MessageRepositoryMySQL";
import { TagRepositoryMySQL } from "../repositories/TagRepositoryMySQL";
import { PostRepositoryMySQL } from "../repositories/PostRepositoryMySQL";
import { ActionRepositoryMySQL } from "../repositories/ActionRepositoryMySQL";
import { SavingsRateRepositoryMySQL } from "../repositories/SavingRateRepositoryMySQL";
import { OrderRepositoryMySQL } from "../repositories/OrderRepositoryMySQL";
import { NotificationRepositoryMySQL } from "../repositories/NotificationRepositoryMySQL";
import { BcryptEncryptionService } from "@infrastructure/adapters/services/BcryptEncryptionService";
import { NodeUuidService } from "@infrastructure/adapters/services/NodeUuidService";
import { SystemClockService } from "@infrastructure/adapters/services/SystemClockService";

// Use Cases
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
import { SeedFormuleCreditUseCase } from "@application/usecases/seeds/SeedFormuleCreditUseCase";

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
import { generateFormuleCredits } from "../../seeds/01C_generateFormulesCredit";
import { FormuleCreditRepositoryMySQL } from "../repositories/FormuleCreditRepositoryMySQL";
import { seedPriceHistory } from "../../seeds/09_generateActionHistories";
import { SeedActionPriceHistoryUseCase } from "@application/usecases/seeds/SeedActionPriceHistoryUseCase";
import { ActionPriceHistoryRepositoryMySQL } from "../repositories/ActionPriceHistoryRepositoryMySQL";

const all = async () => {
  console.log("🌱 Starting database seed...\n");

  // 1. Initialiser le client MySQL
  const mysqlClient = new MySQLClient();

  // 2. Initialiser les repositories
  const userRepository = new UserRepositoryMySQL(mysqlClient);
  const accountRepository = new AccountRepositoryMySQL(mysqlClient);
  const transactionRepository = new TransactionRepositoryMySQL(mysqlClient);
  const creditRepository = new CreditRepositoryMySQL(mysqlClient);
  const threadRepository = new ThreadRepositoryMySQL(mysqlClient);
  const messageRepository = new MessageRepositoryMySQL(mysqlClient);
  const tagRepository = new TagRepositoryMySQL(mysqlClient);
  const postRepository = new PostRepositoryMySQL(mysqlClient);
  const actionRepository = new ActionRepositoryMySQL(mysqlClient);
  const savingsRateRepository = new SavingsRateRepositoryMySQL(mysqlClient);
  const orderRepository = new OrderRepositoryMySQL(mysqlClient);
  const notificationRepository = new NotificationRepositoryMySQL(mysqlClient);
  const formuleRepository = new FormuleCreditRepositoryMySQL(mysqlClient);
  const actionPriceRepository = new ActionPriceHistoryRepositoryMySQL(
    mysqlClient
  );

  // 3. Initialiser les services
  const encryptionService = new BcryptEncryptionService();
  const uuidService = new NodeUuidService();
  const clockService = new SystemClockService();

  // 4. Initialiser les use cases
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

  const seedActionPriceHistoryUsecase = new SeedActionPriceHistoryUseCase(
    actionRepository,
    actionPriceRepository,
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
    advisors,
    clients,
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
  await seedPriceHistory(actions, clockService, seedActionPriceHistoryUsecase);
  await generateSavingsRate(seedSavingsRateUseCase);

  await generateOrders(clients, actions, seedOrderUseCase, clockService);

  await generateNotifications(
    advisors,
    clients,
    seedNotificationUseCase,
    clockService
  );
};

all()
  .then(() => {
    console.log("\n🎉 Seed process completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed process failed:", error);
    process.exit(1);
  });
