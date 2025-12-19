import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";
import { join, resolve } from "path";
import path from "path";
import fs from "fs";

const envPath = join(process.cwd(), ".env");

dotenv.config({ path: envPath });
let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10, // à ajuster selon ton serveur
      queueLimit: 0,
      multipleStatements: true,
    });
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
      console.log(`Database ${this.db} dropped successfully.`);

      await tempConn.execute(`CREATE DATABASE \`${this.db}\``);
      console.log(`Database ${this.db} created successfully.`);

      await tempConn.end();

      // Maintenant, utiliser le pool existant pour exécuter les fichiers SQL
      for (const file of fs
        .readdirSync(SQL_FOLDER)
        .filter((f) => f.endsWith(".sql"))) {
        const filePath = path.join(SQL_FOLDER, file);
        const sql = fs.readFileSync(filePath, "utf-8");
        await this.pool.execute(sql);
        console.log(`Executed ${file}`);
      }

      await this.close();
      console.log("All SQL files executed successfully.");
    } catch (error) {
      console.error("Error resetting database:", error);
    }
  }
}
