import mongoose, { Mongoose, connect } from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Trouve le fichier .env en remontant l'arborescence depuis le fichier courant
 * jusqu'à trouver la racine du monorepo (contenant package.json avec workspaces)
 */
function findEnvFile(): string {
  let currentDir = __dirname;
  const maxDepth = 10; // Sécurité pour éviter une boucle infinie

  for (let i = 0; i < maxDepth; i++) {
    const envPath = path.join(currentDir, ".env");
    const packageJsonPath = path.join(currentDir, "package.json");

    // Vérifier si le .env existe
    if (fs.existsSync(envPath)) {
      // Vérifier si on est bien à la racine du monorepo
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf-8")
          );
          // Si le package.json contient "workspaces", c'est la racine du monorepo
          if (packageJson.workspaces) {
            console.log(`✅ Found .env at: ${envPath}`);
            return envPath;
          }
        } catch (error) {
          // Ignorer les erreurs de parsing et continuer
        }
      }
    }

    // Remonter d'un niveau
    const parentDir = path.dirname(currentDir);

    // Si on est arrivé à la racine du système de fichiers, arrêter
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  // Fallback: essayer des chemins relatifs courants
  const fallbackPaths = [
    resolve(__dirname, "../../../../.env"), // 4 niveaux (Cécile)
    resolve(__dirname, "../../../../../.env"), // 5 niveaux (Jade)
    resolve(__dirname, "../../.env"), // 2 niveaux
    resolve(__dirname, "../../../.env"), // 3 niveaux
  ];

  for (const fallbackPath of fallbackPaths) {
    if (fs.existsSync(fallbackPath)) {
      console.log(`✅ Found .env at fallback path: ${fallbackPath}`);
      return fallbackPath;
    }
  }

  throw new Error(
    "Could not find .env file. Please ensure it exists at the monorepo root."
  );
}

// Charger le .env automatiquement
const envPath = findEnvFile();
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Could not load .env file from ${envPath}`);
  console.warn("Using environment variables from system");
} else {
  console.log(
    `✅ Loaded ${
      Object.keys(result.parsed || {}).length
    } environment variables from ${envPath}`
  );
}
let instance: Mongoose | null = null;

export class MongoClient {
  async connect(): Promise<Mongoose> {
    if (instance) return instance;

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }
    if (!process.env.MONGO_USERNAME) {
      throw new Error("MONGO_USERNAME is not defined");
    }
    if (!process.env.MONGO_PASSWORD) {
      throw new Error("MONGO_PASSWORD is not defined");
    }
    if (!process.env.MONGO_DB_NAME) {
      throw new Error("MONGO_DB_NAME is not defined");
    }

    instance = await connect(process.env.MONGO_URI, {
      auth: {
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_PASSWORD,
      },
      authSource: "admin",
      dbName: process.env.MONGO_DB_NAME,
    });

    console.log("MongoDB connected");
    return instance;
  }

  async disconnect(): Promise<void> {
    if (!instance) return;
    await mongoose.disconnect();
    instance = null;
  }

  /**
   * Equivalent du resetDatabase SQL
   */
  async resetDatabase(): Promise<void> {
    const conn = await this.connect();
    const db = conn.connection.db;

    if (!db) {
      throw new Error("Mongo database connection is not initialized");
    }

    const collections = await db.collections();
    for (const collection of collections) {
      await collection.drop();
    }

    console.log("Mongo database reset");
  }
}
