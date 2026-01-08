import { MongoClient } from "../../MongoClient";

const reset = async () => {
  const mongoClient = new MongoClient();

  console.log("🗑️  Suppression de la base MongoDB...");
  await mongoClient.resetDatabase();

  console.log("✅ Base MongoDB réinitialisée !");

  // Fermer la connexion
  await mongoClient.disconnect();
};

reset()
  .then(() => {
    console.log("🎉 Processus terminé");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur:", error);
    process.exit(1);
  });
