import { UserRepository } from "@application/ports/repositories/UserRepository";
import { MongoClient } from "../../MongoClient";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { UserMapper } from "../../mappers/UserMapper";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { AccountModel } from "../../mongo/models/AccountModel";
import { UserModel } from "../../mongo/models/UserModel";

export class UserRepositoryMongo implements UserRepository {
  constructor(private readonly client: MongoClient) {}

  /** Trouver par ID */
  async findById(id: string): Promise<UserEntity | null> {
    await this.client.connect();
    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;
    return UserMapper.mapDocToUser(doc);
  }

  /** Trouver par email */
  async findByEmail(email: Email): Promise<UserEntity | null> {
    await this.client.connect();
    const doc = await UserModel.findOne({ email: email.value }).lean();
    if (!doc) return null;
    return UserMapper.mapDocToUser(doc);
  }

  /** Trouver par IBAN */
  async findByIban(iban: AccountEntity["iban"]): Promise<UserEntity | null> {
    await this.client.connect();
    const account = await AccountModel.findOne({ iban: iban.value })
      .populate({ path: "userId", model: "User" })
      .lean();

    if (!account || !account.userId) return null;
    return UserMapper.mapDocToUser(account.userId);
  }

  /** Tous les utilisateurs */
  async findAll(): Promise<UserEntity[]> {
    await this.client.connect();
    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(UserMapper.mapDocToUser);
  }

  /** Utilisateurs actifs, optionnellement filtrés par rôle */
  async findAllByRoleAndIsActif(
    role?: UserEntity["role"]
  ): Promise<UserEntity[]> {
    await this.client.connect();

    const query: Record<string, unknown> = {
      isActive: true,
      confirmedAt: { $ne: null },
    };
    if (role) query.role = role;

    const docs = await UserModel.find(query)
      .sort({ lastname: 1, firstname: 1 })
      .lean();

    return docs.map(UserMapper.mapDocToUser);
  }

  /** Sauvegarder un utilisateur (create) */
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
      phoneNumber: user.phoneNumber ?? null,
      sexe: user.sexe ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
      address: user.address?.address ?? null,
      city: user.address?.city ?? null,
      country: user.address?.country ?? null,
      postalCode: user.address?.postalCode ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      confirmedAt: user.confirmedAt ?? null,
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
          phoneNumber: user.phoneNumber ?? null,
          sexe: user.sexe ?? null,
          dateOfBirth: user.dateOfBirth ?? null,
          address: user.address?.address ?? null,
          city: user.address?.city ?? null,
          country: user.address?.country ?? null,
          postalCode: user.address?.postalCode ?? null,
          confirmedAt: user.confirmedAt ?? null,
          updatedAt: user.updatedAt,
        },
      }
    );
  }

  /** Supprimer un utilisateur */
  async delete(id: string): Promise<void> {
    await this.client.connect();
    await UserModel.deleteOne({ _id: id });
  }

  /** Compter les utilisateurs actifs par rôle */
  async countUserByRole(role: UserEntity["role"]): Promise<number> {
    await this.client.connect();
    return UserModel.countDocuments({
      isActive: true,
      confirmedAt: { $ne: null },
      role,
    });
  }
}
