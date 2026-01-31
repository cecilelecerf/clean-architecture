import { PostEvent } from './route';

class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  private connections: Map<string, ReadableStreamDefaultController>;

  private constructor() {
    this.connections = new Map();
  }

  public static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  public addConnection(userId: string, controller: ReadableStreamDefaultController) {
    this.connections.set(userId, controller);
    console.log('💾 Connection stored:', {
      userId,
      totalConnections: this.connections.size,
      allKeys: Array.from(this.connections.keys()),
    });
  }

  public removeConnection(userId: string) {
    this.connections.delete(userId);
    console.log('🔌 Connection removed:', {
      userId,
      remainingConnections: this.connections.size,
    });
  }

  public broadcast(userId: string, event: PostEvent) {
    console.log('📡 Broadcasting:', {
      targetUserId: userId,
      eventType: event.type,
      totalConnections: this.connections.size,
      allKeys: Array.from(this.connections.keys()),
      hasConnection: this.connections.has(userId),
    });

    const controller = this.connections.get(userId);

    if (controller) {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      try {
        controller.enqueue(new TextEncoder().encode(data));
        console.log(`✅ Broadcasted to user ${userId}:`, event.type);
      } catch (error) {
        console.error('❌ Error broadcasting:', error);
        this.removeConnection(userId);
      }
    } else {
      console.log('⚠️ No connection found for user:', userId);
    }
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }
}

export const sseManager = SSEConnectionManager.getInstance();
