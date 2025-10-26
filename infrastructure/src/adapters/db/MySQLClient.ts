import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

/**
 * Wrapper générique autour de mysql2/promise
 * pour centraliser la connexion et exécuter des requêtes SQL typées.
 */
export class MySQLClient {
  private pool: Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
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
}
