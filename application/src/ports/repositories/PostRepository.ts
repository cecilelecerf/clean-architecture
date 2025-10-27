import { PostEntity } from "@domain/entities/PostEntity";
import { TagEntity } from "@domain/entities/TagEntity";
import { UserEntity } from "@domain/entities/UserEntity";

export interface PostRepository {
  /** 📬 Créer un nouveau Post */
  save(feed: PostEntity): Promise<void>;

  /** 🔍 Trouver un Post par son ID */
  findById(id: PostEntity["id"]): Promise<PostEntity | null>;

  /** 👨‍💼 Trouver toutes les Posts envoyées par un conseiller */
  findAllByAdvisorId(advisorId: UserEntity["id"]): Promise<PostEntity[]>;

  /** 🕒 Récupérer les Posts récentes d’un client  */
  findAllRecent(limit?: number): Promise<PostEntity[]>;

  /** ✅ Mettre à jour un Posts  */
  update(feed: PostEntity): Promise<void>;

  /** ❌ Supprimer un Posts */
  delete(id: PostEntity["id"]): Promise<void>;

  /** 🔍 Trouver tous les Posts par son tagId */
  findAllByTags(id: TagEntity["id"]): Promise<PostEntity[]>;
}
