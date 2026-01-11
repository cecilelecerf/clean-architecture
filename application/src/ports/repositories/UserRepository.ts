import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";
import { IBAN } from "@domain/values/IBAN";

export interface UserRepository {
  findById(id: UserEntity["id"]): Promise<UserEntity | null>;
  findByEmail(email: Email): Promise<UserEntity | null>;
  findByIban(iban: IBAN): Promise<UserEntity | null>;
  findAllByRoleAndIsActif(role?: UserEntity["role"]): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<void>;
  update(user: UserEntity): Promise<void>;
  countUserByRole(role: UserEntity["role"]): Promise<number>;
}
