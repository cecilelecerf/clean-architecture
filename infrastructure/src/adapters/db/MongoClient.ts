import mongoose, { Mongoose, connect } from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../../../.env") });

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
