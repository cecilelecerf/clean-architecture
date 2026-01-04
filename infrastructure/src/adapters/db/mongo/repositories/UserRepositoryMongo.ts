import { UserRepository } from "@application/ports/repositories/UserRepository";
import { MongoClient } from "../../MongoClient";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { UserModel } from "../models/UserModel";
import { UserMapper } from "../../mappers/UserMapper";
import { AccountEntity } from "@domain/entities/AccountEntity";
import { AccountModel } from "../models/AccountModel";

export class UserRepositoryMongo implements UserRepository {
  constructor(private readonly client: MongoClient) {}

  async findById(id: UserEntity["id"]): Promise<UserEntity | null> {
    await this.client.connect();

    const doc = await UserModel.findById(id).lean();
    if (!doc) return null;

    return UserMapper.mapDocToUser(doc);
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    await this.client.connect();

    const doc = await UserModel.findOne({ email: email.value }).lean();
    if (!doc) return null;

    return UserMapper.mapDocToUser(doc);
  }

  async findByIban(iban: AccountEntity["iban"]): Promise<UserEntity | null> {
    await this.client.connect();

    const account = await AccountModel.findOne({ iban: iban.value })
      .populate({
        path: "userId",
        model: "User",
      })
      .lean();

    if (!account || !account.userId) return null;

    return UserMapper.mapDocToUser(account.userId);
  }

  async findAll(): Promise<UserEntity[]> {
    await this.client.connect();

    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();

    return docs.map((doc) => UserMapper.mapDocToUser(doc));
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

    const docs = await UserModel.find(query)
      .sort({ lastname: 1, firstname: 1 })
      .lean();

    return docs.map((doc) => UserMapper.mapDocToUser(doc));
  }

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

  async delete(id: UserEntity["id"]): Promise<void> {
    await this.client.connect();

    await UserModel.deleteOne({ _id: id });
  }

  async countUserByRole(role: UserEntity["role"]): Promise<number> {
    await this.client.connect();

    return await UserModel.countDocuments({
      isActive: true,
      confirmedAt: { $ne: null },
      role,
    });
  }
}
