import { MySQLClient } from "../../MySQLClient";
import { seedSQLClient } from "./01_client";
import { seedSQLAdministrator } from "./02_advisor";
import { seedSQLDirector } from "./03_director";
import { generateExternalThreads } from "./04_external_thread";
import { generateInternalThreads } from "./05_internal_thread";
import { generateTags } from "./06_tags";
import { generatePosts } from "./07_posts";

const all = async () => {
  const mysqlClient = new MySQLClient();
  const clients = await seedSQLClient(mysqlClient);
  const advisors = await seedSQLAdministrator(mysqlClient);
  const directors = await seedSQLDirector(mysqlClient);
  await generateExternalThreads(clients, advisors, mysqlClient);
  await generateInternalThreads(directors, advisors, mysqlClient);
  const tags = await generateTags(mysqlClient);
  await generatePosts(advisors, directors, tags, mysqlClient);
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
