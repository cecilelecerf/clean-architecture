import { MongoClient } from "../../MongoClient";
import { seedMongoAdministrator } from "./01_advisor";
import { seedMongoClient } from "./02_client";
import { seedMongoDirector } from "./03_director";
import { generateExternalThreadsMongo } from "./04_external_thread";
import { generateInternalThreadsMongo } from "./05_internal_thread";
import { generateTagsMongo } from "./06_tags";
import { generatePostsMongo } from "./07_posts";
import { generateActions } from "./08_action";
import { generateSavingsRateMongo } from "./09_savingsrate";
import { generateOrdersMongo } from "./10_orders";
import { generateNotificationsMongo } from "./11_notification";
import { generateCreditsMongo } from "./12_credits";
import { generateBankAccountsMongo } from "./13_bank_accounts";

const all = async () => {
  const mongoClient = new MongoClient();
  const advisors = await seedMongoAdministrator(mongoClient);
  const clients = await seedMongoClient(mongoClient);
  const directors = await seedMongoDirector(mongoClient);
  await generateExternalThreadsMongo(clients, advisors, mongoClient);
  await generateInternalThreadsMongo(directors, advisors, mongoClient);
  const tags = await generateTagsMongo(mongoClient);
  await generatePostsMongo(advisors, directors, clients, tags, mongoClient);
  const actions = await generateActions(mongoClient);
  await generateSavingsRateMongo(mongoClient);
  await generateOrdersMongo(mongoClient, clients, actions);
  await generateNotificationsMongo(mongoClient, advisors, clients);
  await generateCreditsMongo(mongoClient, clients);
  await generateBankAccountsMongo(mongoClient);
};

all()
  .then(() => {
    console.log("🎉 Processus terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Échec du seed:", error);
    process.exit(1);
  });
