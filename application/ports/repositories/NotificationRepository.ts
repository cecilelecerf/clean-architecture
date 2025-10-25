import { NotificationEntity } from "@domain/entities/NotificationEntity";

export interface NotificationRepository {
  /** 📬 Créer une nouvelle notification */
  save(notification: NotificationEntity): Promise<void>;

  /** 🔍 Trouver une notification par son ID */
  findById(id: NotificationEntity["id"]): Promise<NotificationEntity | null>;

  /** 📦 Trouver toutes les notifications d’un client */
  findAllByClientId(
    clientId: NotificationEntity["clientId"]
  ): Promise<NotificationEntity[]>;

  /** 👨‍💼 Trouver toutes les notifications envoyées par un conseiller */
  findAllByAdvisorId(
    advisorId: NotificationEntity["advisorId"]
  ): Promise<NotificationEntity[]>;

  /** 🕒 Récupérer les notifications récentes d’un client (ex: dernières 24h) */
  findRecentByClientId(
    clientId: NotificationEntity["clientId"],
    limit?: number
  ): Promise<NotificationEntity[]>;

  /** ✅ Mettre à jour une notification (par exemple : marquée comme lue) */
  update(notification: NotificationEntity): Promise<void>;

  /** ❌ Supprimer une notification */
  delete(id: NotificationEntity["id"]): Promise<void>;
}
