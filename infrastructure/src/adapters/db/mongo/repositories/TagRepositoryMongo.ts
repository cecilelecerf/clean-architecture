import { TagRepository } from "@application/ports/repositories/TagRepository";
import { MongoClient } from "../../MongoClient";
import { TagEntity } from "@domain/entities/TagEntity";
import { TagModel } from "../models/TagModel";
import { Color } from "@domain/values/Color";

export class TagRepositoryMongo implements TagRepository {
  constructor(private readonly client: MongoClient) {}

  private mapDocToTag(doc: any): TagEntity {
    const color = Color.from(doc.color);
    if (color instanceof Error) throw color;

    return TagEntity.from({
      id: doc._id.toString(),
      label: doc.label,
      color,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Sauvegarder un tag */
  async save(tag: TagEntity): Promise<void> {
    await this.client.connect();

    await TagModel.create({
      label: tag.label,
      color: tag.color.getValue(),
      createdAt: tag.createdAt,
    });
  }

  /** Trouver un tag par ID */
  async findById(id: TagEntity["id"]): Promise<TagEntity | null> {
    await this.client.connect();

    const doc = await TagModel.findById(id).lean();
    if (!doc) return null;

    return this.mapDocToTag(doc);
  }

  /** Tous les tags */
  async findAll(): Promise<TagEntity[]> {
    await this.client.connect();

    const docs = await TagModel.find().sort({ label: 1 }).lean();

    return docs.map((doc) => this.mapDocToTag(doc));
  }

  /** Mettre à jour un tag */
  async update(tag: TagEntity): Promise<void> {
    await this.client.connect();

    await TagModel.updateOne(
      { _id: tag.id },
      {
        $set: {
          label: tag.label,
          color: tag.color.getValue(),
          updatedAt: tag.updatedAt,
        },
      }
    );
  }

  /** Supprimer un tag */
  async delete(id: TagEntity["id"]): Promise<void> {
    await this.client.connect();

    await TagModel.deleteOne({ _id: id });
  }
}
