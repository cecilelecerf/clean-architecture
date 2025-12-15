import { TagRepository } from "@application/ports/repositories/TagRepository";
import { MongoClient } from "../../MongoClient";
import { TagEntity } from "@domain/entities/TagEntity";
import { TagModel } from "../models/TagModel";
import { Color } from "@domain/values/Color";

//TODO : modifier les modifiedAt en updateAt
export class TagRepositoryMongo implements TagRepository {
    constructor(private readonly client: MongoClient) {}

    async save(tag: TagEntity): Promise<void> {
        await this.client.connect();
                                              
        await TagModel.create({
            label: tag.label,
            color: tag.color,
            createdAt: tag.createdAt
        } as any);
    }

    async findById(id: TagEntity["id"]): Promise<TagEntity | null> {
        await this.client.connect();
                
        const doc = await TagModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        const color = Color.from(doc.color);
        if (color instanceof Error) throw color;

        return TagEntity.from({
            id: doc._id.toString(),
            label: doc.label,
            color,
            createdAt: doc.createdAt,
            modifiedAt: doc.updatedAt ?? null,
        });
    }

    async findAll(): Promise<TagEntity[]> {
        await this.client.connect();
        
        const docs = await TagModel.find().lean();
        
        return docs.map((doc) => {
            const color = Color.from(doc.color);
            if (color instanceof Error) throw color;

            return TagEntity.from({
                id: doc._id.toString(),
                label: doc.label,
                color,
                createdAt: doc.createdAt,
                modifiedAt: doc.updatedAt ?? null,
            });
        })
    }

    async update(tag: TagEntity): Promise<void> {
        await this.client.connect();
                                                
        await TagModel.updateOne(
            { _id: tag.id },
            {
                $set: {
                    label: tag.label,
                    color: tag.color,
                    modifiedAt: tag.modifiedAt || new Date(),
                },
            }
        );
    }

    async delete(id: TagEntity["id"]): Promise<void> {
        await this.client.connect();
                                        
        await TagModel.deleteOne({ _id: id });
    }
}