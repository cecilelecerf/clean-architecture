import { MySQLClient } from "../../MySQLClient";
<<<<<<< HEAD
<<<<<<< HEAD:infrastructure/src/adapters/db/mysql/seeds/index.ts
import { seedSQLAdministrator } from "./01_advisor";
import { seedSQLClient } from "./02_client";
=======
import { seedSQLClient } from "./01_client";
import { seedSQLAdministrator } from "./02_advisor";
>>>>>>> 2ce9cab (thread)
import { seedSQLDirector } from "./03_director";
import { generateExternalThreads } from "./04_external_thread";
import { generateInternalThreads } from "./05_internal_thread";
import { generateTags } from "./06_tags";
import { generatePosts } from "./07_posts";

const all = async () => {
  const mysqlClient = new MySQLClient();
<<<<<<< HEAD
  const advisors = await seedSQLAdministrator(mysqlClient);
  const clients = await seedSQLClient(mysqlClient, advisors);
=======
  const clients = await seedSQLClient(mysqlClient);
  const advisors = await seedSQLAdministrator(mysqlClient);
>>>>>>> 2ce9cab (thread)
  const directors = await seedSQLDirector(mysqlClient);
  await generateExternalThreads(clients, advisors, mysqlClient);
  await generateInternalThreads(directors, advisors, mysqlClient);
  const tags = await generateTags(mysqlClient);
<<<<<<< HEAD
  await generatePosts(advisors, directors, clients, tags, mysqlClient);
=======
import { seedSQLClient } from "./01_client";
import { seedSQLAdministrator } from "./02_advisor";
import { seedSQLDirector } from "./03_director";

const all = async () => {
  const mysqlClient = new MySQLClient();
  await seedSQLClient(mysqlClient);
  await seedSQLAdministrator(mysqlClient);
  await seedSQLDirector(mysqlClient);
>>>>>>> 9e13f8e (create seeds):infrastructure/src/adapters/db/seeds/mysql/index.ts
=======
  await generatePosts(advisors, directors, tags, mysqlClient);
>>>>>>> 2ce9cab (thread)
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
