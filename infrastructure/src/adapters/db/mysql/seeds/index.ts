import { MySQLClient } from "../../MySQLClient";
import { seedSQLAdministrator } from "./01_advisor";
import { seedSQLClient } from "./02_client";
import { seedSQLDirector } from "./03_director";
import { generateExternalThreads } from "./04_external_thread";
import { generateInternalThreads } from "./05_internal_thread";
import { generateTags } from "./06_tags";
import { generatePosts } from "./07_posts";

const all = async () => {
  const mysqlClient = new MySQLClient();
  const advisors = await seedSQLAdministrator(mysqlClient);
  const clients = await seedSQLClient(mysqlClient, advisors);
  const directors = await seedSQLDirector(mysqlClient);
  await generateExternalThreads(clients, advisors, mysqlClient);
  await generateInternalThreads(directors, advisors, mysqlClient);
  const tags = await generateTags(mysqlClient);
  await generatePosts(advisors, directors, clients, tags, mysqlClient);
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
