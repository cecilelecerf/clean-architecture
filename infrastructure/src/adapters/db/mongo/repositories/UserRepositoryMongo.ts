import { UserRepository } from "@application/ports/repositories/UserRepository";
import { MongoClient } from "../../MongoClient";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { UserModel } from "../models/UserModel";

export class UserRepositoryMongo implements UserRepository {
    constructor(private readonly client: MongoClient) {}

    async findById(id: UserEntity["id"]): Promise<UserEntity | null> {
        await this.client.connect();
                        
        const doc = await UserModel.findOne({ _id: id }).lean();
        if (!doc) return null;

        const email = Email.create(doc.email);
        if (email instanceof Error) throw email;

        return UserEntity.from({
            id: doc._id.toString(),
            firstname: doc.firstname,
            lastname: doc.lastname,
            email: email,
            passwordHash: doc.passwordHash,
            role: doc.role,
            isActiveField: doc.isActiveField,
            createdAt: doc.createdAt,
            confirmedAt: doc.confirmedAt ?? null,
            updatedAt: doc.updatedAt ?? null,
            advisorId: doc.advisorId ?? null
        });
    }

    async findByEmail(email: Email): Promise<UserEntity | null> {
        await this.client.connect();
                        
        const doc = await UserModel.findOne({ email: email }).lean();
        if (!doc) return null;

        return UserEntity.from({
            id: doc._id.toString(),
            firstname: doc.firstname,
            lastname: doc.lastname,
            email: email,
            passwordHash: doc.passwordHash,
            role: doc.role,
            isActiveField: doc.isActiveField,
            createdAt: doc.createdAt,
            confirmedAt: doc.confirmedAt ?? null,
            updatedAt: doc.updatedAt ?? null,
            advisorId: doc.advisorId ?? null
        });
    }

    async findAll(): Promise<UserEntity[]> {
        await this.client.connect();
        
        const docs = await UserModel.find().lean();
        
        return docs.map((doc) => {
            const email = Email.create(doc.email);
            if (email instanceof Error) throw email;

            return UserEntity.from({
                id: doc._id.toString(),
                firstname: doc.firstname,
                lastname: doc.lastname,
                email: email,
                passwordHash: doc.passwordHash,
                role: doc.role,
                isActiveField: doc.isActiveField,
                createdAt: doc.createdAt,
                confirmedAt: doc.confirmedAt ?? null,
                updatedAt: doc.updatedAt ?? null,
                advisorId: doc.advisorId ?? null
            });
        })
    }

    async findAllByRoleAndIsActif(
        role?: UserEntity["role"]
    ): Promise<UserEntity[]> {
        await this.client.connect();

        const query: Record<string, any> = {
            isActive: true,
            confirmedAt: { $ne: null },
        };

        if (role) {
            query.role = role;
        }

        const docs = await UserModel.find(query).lean();

        return docs.map((doc) =>
            UserEntity.from({
                id: doc._id.toString(),
                firstname: doc.firstname,
                lastname: doc.lastname,
                email: doc.email,
                passwordHash: doc.passwordHash,
                role: doc.role,
                isActiveField: doc.isActive,
                createdAt: doc.createdAt,
                confirmedAt: doc.confirmedAt,
                updatedAt: doc.updatedAt,
            })
        );
    }

    async save(user: UserEntity): Promise<void> {
        await this.client.connect();
                        
        await UserModel.create({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role,
            isActiveField: user.isActiveField,
            createdAt: user.createdAt,
            confirmedAt: user.confirmedAt ?? null,
            updatedAt: user.updatedAt ?? null,
            advisorId: user.advisorId ?? null
        } as any);
    }

    async update(user: UserEntity): Promise<void> {
        await this.client.connect();
                        
        await UserModel.updateOne(
            { _id: user.id },
            {
                $set: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    passwordHash: user.passwordHash,
                    role: user.role,
                    isActiveField: user.isActiveField,
                    confirmedAt: user.confirmedAt ?? null,
                    updatedAt: user.updatedAt || new Date(),
                    advisorId: user.advisorId ?? null
                },
            }
        );
    }

    async delete(id: UserEntity["id"]): Promise<void> {
        await this.client.connect();
                        
        await UserModel.deleteOne({ _id: id });
    }
}