import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";

export interface UserRepository {
  findById(id: UserEntity["id"]): Promise<UserEntity | null>;
  findByEmail(email: Email): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findAllByRole(role: UserEntity["role"]): Promise<UserEntity[]>;
  banUser(user: UserEntity): Promise<void>;
  saveUser(user: UserEntity): Promise<void>;
  updateUser(user: UserEntity): Promise<void>;
  deleteUser(user: UserEntity): Promise<void>;
}
