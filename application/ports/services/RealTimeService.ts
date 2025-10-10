import { UserEntity } from "@domain/entities/UserEntity";

export interface RealTimeEvent {
  to: UserEntity["id"] | UserEntity["id"][];
  type: string; // ex: "message:new", "typing:start", "feed:update"
  payload: Record<string, unknown>; // données associées à l’événement
  sentAt?: Date;
}

export interface RealTimeService {
  /**
   * Envoie un événement en temps réel à un ou plusieurs utilisateurs
   */
  emit(event: RealTimeEvent): Promise<void>;

  /**
   * Diffuse un événement à tout le monde (ex: conversation interne, groupe)
   */
  broadcast(event: RealTimeEvent): Promise<void>;
}
