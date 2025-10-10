import { TagEntity } from "@domain/entities/TagEntity";

export interface TagRepository {
  /** 📬 Créer un nouveau tag */
  create(tag: TagEntity): Promise<void>;

  /** 🔍 Trouver un tag par son ID */
  findById(id: TagEntity["id"]): Promise<TagEntity | null>;

  /** 📦 Trouver tous les tags */
  findAll(): Promise<TagEntity[]>;

  /** ✅ Mettre à jour un tag */
  update(tag: TagEntity): Promise<void>;

  /** ❌ Supprimer un tag */
  delete(id: TagEntity["id"]): Promise<void>;
}
