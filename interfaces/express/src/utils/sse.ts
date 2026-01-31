import { Response } from "express";

export interface PostEvent {
  type: "publish_post" | "unpublish_post" | "connected";
  post?: any;
  timestamp?: Date;
}

class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  private connections: Map<string, Response>;

  private constructor() {
    this.connections = new Map();
  }

  public static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  public addConnection(userId: string, res: Response) {
    this.connections.set(userId, res);
    console.log("💾 Connection stored:", {
      userId,
      totalConnections: this.connections.size,
      allKeys: Array.from(this.connections.keys()),
    });
  }

  public removeConnection(userId: string) {
    const res = this.connections.get(userId);
    if (res) {
      res.end(); // Fermer la connexion proprement
    }
    this.connections.delete(userId);
    console.log("🔌 Connection removed:", {
      userId,
      remainingConnections: this.connections.size,
    });
  }

  public broadcast(userId: string, event: PostEvent) {
    console.log("📡 Broadcasting:", {
      targetUserId: userId,
      eventType: event.type,
      totalConnections: this.connections.size,
      allKeys: Array.from(this.connections.keys()),
      hasConnection: this.connections.has(userId),
    });

    const res = this.connections.get(userId);

    if (!res) {
      console.log("⚠️ No connection found for user:", userId);
      return;
    }

    const data = `data: ${JSON.stringify(event)}\n\n`;

    try {
      res.write(data);
      console.log(`✅ Broadcasted to user ${userId}:`, event.type);
    } catch (error) {
      console.error("❌ Error broadcasting:", error);
      this.removeConnection(userId);
    }
  }

  public broadcastToAll(event: PostEvent) {
    console.log("📢 Broadcasting to ALL users:", {
      eventType: event.type,
      totalConnections: this.connections.size,
    });

    const data = `data: ${JSON.stringify(event)}\n\n`;
    let successCount = 0;
    let errorCount = 0;

    this.connections.forEach((res, userId) => {
      try {
        res.write(data);
        successCount++;
        console.log(`✅ Sent to user ${userId}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error sending to user ${userId}:`, error);
        this.removeConnection(userId);
      }
    });

    console.log(
      `📊 Broadcast summary: ${successCount} success, ${errorCount} errors`,
    );
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }
}

export const sseManager = SSEConnectionManager.getInstance();
