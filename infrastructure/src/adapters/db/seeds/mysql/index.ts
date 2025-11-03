import { MySQLClient } from "../../MySQLClient";
import { seedSQLClient } from "./01_client";
import { seedSQLAdministrator } from "./02_advisor";
import { seedSQLDirector } from "./03_director";

const all = async () => {
  const mysqlClient = new MySQLClient();
  await seedSQLClient(mysqlClient);
  await seedSQLAdministrator(mysqlClient);
  await seedSQLDirector(mysqlClient);
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
