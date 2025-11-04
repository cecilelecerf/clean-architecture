import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";

export interface UserRepository {
  findById(id: UserEntity["id"]): Promise<UserEntity | null>;
  findByEmail(email: Email): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findAllByRole(role: UserEntity["role"]): Promise<UserEntity[]>;
  findAllByAdvisor(advisorId: UserEntity["id"]): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<void>;
  update(user: UserEntity): Promise<void>;
  delete(id: UserEntity["id"]): Promise<void>;
  findLeastAssignedActiveAdvisor(): Promise<UserEntity | null>;
}
