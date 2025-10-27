import { UserEntity } from "@domain/entities/UserEntity";
type SocketType =
  | "feed:new"
  | "feed:delete"
  | "feed:update"
  | "message:new"
  | "message:update"
  | "message:read"
  | "message:delete";

export interface RealTimeEvent {
  to: UserEntity["id"][];
  type: SocketType;
  payload: Record<string, unknown>;
  sentAt?: Date;
}

export interface RealTimeService {
  /**
   * Envoie un événement en temps réel à un ou plusieurs utilisateurs
   */
  emitUsers(event: RealTimeEvent): Promise<void>;

  /**
   * Envoie un événement en temps réel à un ou plusieurs utilisateurs
   */
  emitRooms(
    event: Omit<RealTimeEvent, "to"> & { rooms: string[] }
  ): Promise<void>;

  /**
   * Diffuse un événement à tout le monde (ex: conversation interne, groupe)
   */
  broadcast(event: RealTimeEvent): Promise<void>;
}
