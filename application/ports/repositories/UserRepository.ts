import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";

export interface UserRepository {
  findById(id: string): Promise<UserEntity>;
  findByEmail(email: Email): Promise<UserEntity[]>;
  findAll(): Promise<UserEntity[]>;
  banUser(user: UserEntity): Promise<void>;
  saveUser(user: UserEntity): Promise<void>;
  updateUser(user: UserEntity): Promise<void>;
  deleteUser(user: UserEntity): Promise<void>;
}