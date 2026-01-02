import { UserRepository } from "@application/ports/repositories/UserRepository";
import { MongoClient } from "../../MongoClient";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { UserModel } from "../models/UserModel";
import { UserMapper } from "../../mappers/UserMapper";
import { IBAN } from "@domain/values/IBAN";
import { AccountEntity } from "@domain/entities/AccountEntity";

export class UserRepositoryMongo implements UserRepository {
  constructor(private readonly client: MongoClient) {}

  /** Trouver un utilisateur par ID */
  async findById(id: UserEntity["id"]): Promise<UserEntity | null> {
    await this.client.connect();

    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;

    return UserMapper.mapRowToUser(doc);
  }

  /** Trouver un utilisateur par email */
  async findByEmail(email: Email): Promise<UserEntity | null> {
    await this.client.connect();

    const doc = await UserModel.findOne({ email: email.value }).lean();
    if (!doc) return null;

    return UserMapper.mapRowToUser(doc);
  }

  /** Tous les utilisateurs */
  async findAll(): Promise<UserEntity[]> {
    await this.client.connect();

    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();

    return docs.map((doc) => UserMapper.mapRowToUser(doc));
  }

  /** Trouver un utilisateur par iban */
  async findByIban(iban: AccountEntity["iban"]): Promise<UserEntity | null> {
    await this.client.connect();

    const doc = await UserModel.findOne({ iban: iban }).lean();
    if (!doc) return null;

    return UserMapper.mapRowToUser(doc);
  }

  /** Utilisateurs actifs par rôle */
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

    const docs = await UserModel.find(query)
      .sort({ lastname: 1, firstname: 1 })
      .lean();

    return docs.map((doc) => UserMapper.mapRowToUser(doc));
  }

  /** Sauvegarder un utilisateur */
  async save(user: UserEntity): Promise<void> {
    await this.client.connect();

    await UserModel.create({
      _id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email.value,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActiveField,
      createdAt: user.createdAt,
      confirmedAt: user.confirmedAt ?? null,
      updatedAt: user.updatedAt,
    });
  }

  /** Mettre à jour un utilisateur */
  async update(user: UserEntity): Promise<void> {
    await this.client.connect();

    await UserModel.updateOne(
      { _id: user.id },
      {
        $set: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email.value,
          passwordHash: user.passwordHash,
          role: user.role,
          isActive: user.isActiveField,
          confirmedAt: user.confirmedAt ?? null,
          updatedAt: user.updatedAt,
        },
      }
    );
  }

  /** Supprimer un utilisateur */
  async delete(id: UserEntity["id"]): Promise<void> {
    await this.client.connect();

    await UserModel.deleteOne({ _id: id });
  }
}
