import { FeedItemEntity } from "@domain/entities/FeedItemEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface FeedRepository {
  /** 📬 Créer un nouveau itemFeed */
  create(feed: FeedItemEntity): Promise<void>;

  /** 🔍 Trouver un itemFeed par son ID */
  findById(id: FeedItemEntity["id"]): Promise<FeedItemEntity | null>;

  /** 👨‍💼 Trouver toutes les itemsFeed envoyées par un conseiller */
  findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<FeedItemEntity[]>;

  /** 🕒 Récupérer les itemsFeed récentes d’un client  */
  findAllRecent(limit?: number): Promise<FeedItemEntity[]>;

  /** ✅ Mettre à jour un itemsFeed  */
  update(feed: FeedItemEntity): Promise<void>;

  /** ❌ Supprimer un itemsFeed */
  delete(id: FeedItemEntity["id"]): Promise<void>;

  /** 🔍 Trouver tous les itemsFeed par son tagId */
  findAllByTags(id: TagEntity["id"]): Promise<FeedItemEntity[]>;
}
