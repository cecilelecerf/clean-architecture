import { UserEntity } from "@domain/entities/UserEntity";

export interface NotificationMessage {
  to: UserEntity["id"] | UserEntity["id"][];
  title: string;
  body: string;
  type: "push" | "internal"; // interne = notification dans l'app
  data?: Record<string, unknown>; // éventuelles métadonnées (ex: lien, id, etc.)
  sentAt?: Date;
}

export interface NotificationService {
  send(notification: NotificationMessage): Promise<void>;
}
