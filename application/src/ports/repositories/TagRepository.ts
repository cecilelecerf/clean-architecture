import { TagEntity } from "@domain/entities/TagEntity";

export interface TagRepository {
  save(tag: TagEntity): Promise<void>;
  findById(id: TagEntity["id"]): Promise<TagEntity | null>;
  findAll(): Promise<TagEntity[]>;
  update(tag: TagEntity): Promise<void>;
  delete(id: TagEntity["id"]): Promise<void>;
}
