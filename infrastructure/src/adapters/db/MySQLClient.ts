import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

let pool: Pool;

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

function getPool(): Pool {
  if (!pool) {
    const config = {
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    };

    // Log de debug pour vérifier la configuration
    console.log("🔌 Creating MySQL pool with config:", {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      password: config.password ? "***" : undefined,
    });

    pool = mysql.createPool(config);
  }
  return pool;
}

/**
 * Wrapper générique autour de mysql2/promise
 * pour centraliser la connexion et exécuter des requêtes SQL typées.
 */
export class MySQLClient {
  private pool: Pool;
  private host = process.env.MYSQL_HOST;
  private user = process.env.MYSQL_USER;
  private password = process.env.MYSQL_PASSWORD;
  private db = process.env.MYSQL_DATABASE;

  constructor() {
    this.pool = getPool();
  }

  /**
   * Exécute une requête SQL et renvoie les lignes de résultat.
   * Exemple :
   *   const rows = await client.query("SELECT * FROM users WHERE id = ?", [id]);
   */
  async query<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params: any[] = []
  ): Promise<T> {
    const [rows] = await this.pool.execute<T>(sql, params);
    return rows;
  }

  async queryRows<T extends RowDataPacket[]>(
    sql: string,
    params: any[] = []
  ): Promise<T> {
    const [rows] = await this.pool.execute<T>(sql, params);
    return rows;
  }

  async queryResult(sql: string, params: any[] = []): Promise<ResultSetHeader> {
    const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
    return result;
  }

  /**
   * Ferme proprement la connexion (utile pour les tests ou les scripts courts)
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Helper pour les transactions : exécute plusieurs opérations atomiquement
   */
  async transaction<T>(
    fn: (conn: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async resetDatabase() {
    try {
      const SQL_FOLDER = resolve(__dirname, "./mysql/schemas");

      // Connexion temporaire sans DB pour drop/create
      const tempConn = await mysql.createConnection({
        host: this.host,
        port: Number(process.env.MYSQL_PORT),
        user: this.user,
        password: this.password,
        multipleStatements: true,
      });

      await tempConn.execute(`DROP DATABASE IF EXISTS \`${this.db}\``);
      console.log(`✅ Database ${this.db} dropped successfully.`);

      await tempConn.execute(`CREATE DATABASE \`${this.db}\``);
      console.log(`✅ Database ${this.db} created successfully.`);

      await tempConn.end();

      // Maintenant, utiliser le pool existant pour exécuter les fichiers SQL
      const sqlFiles = fs
        .readdirSync(SQL_FOLDER)
        .filter((f) => f.endsWith(".sql"))
        .sort(); // Trier pour garantir l'ordre d'exécution

      for (const file of sqlFiles) {
        const filePath = path.join(SQL_FOLDER, file);
        const sql = fs.readFileSync(filePath, "utf-8");
        await this.pool.execute(sql);
        console.log(`✅ Executed ${file}`);
      }

      await this.close();
      console.log("✅ All SQL files executed successfully.");
    } catch (error) {
      console.error("❌ Error resetting database:", error);
      throw error;
    }
  }
}
