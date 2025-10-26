import { UserRepository } from "@application/ports/repositories/UserRepository";
import { UserEntity } from "@domain/entities/UserEntity";

export class ListClientsUsecase {
  public constructor(private readonly userRepository: UserRepository) {}
  // TODO : vérification role
  public async execute(): Promise<UserEntity[]> {
    return await this.userRepository.findAllByRole("client");
  }
}
