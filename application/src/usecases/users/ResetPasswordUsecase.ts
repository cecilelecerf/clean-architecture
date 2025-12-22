// packages/application/src/usecases/auth/ResetPasswordUsecase.ts

import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { TokenService } from "@application/ports/services/TokenService";
import { UserEntity, UserToFront } from "@domain/entities/UserEntity";
import { UserNotFoundError } from "@application/errors/users";
import { ClockService } from "@application/ports/services/ClockService";

type Props = {
  token: string;
  newPassword: string;
};

export class ResetPasswordUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly encryptionService: EncryptionService,
    private readonly clockService: ClockService
  ) {}

  async execute({
    token,
    newPassword,
  }: Props): Promise<UserToFront | UserNotFoundError | Error> {
    try {
      const payload = await this.tokenService.validateToken(
        token,
        "passwordReset"
      );
      console.log(payload);
      console.log(!payload);
      console.log(!payload.userId);
      if (!payload || !payload.userId) {
        return new Error("Token invalide ou expiré");
      }

      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        return new UserNotFoundError();
      }
      const passwordHash = await this.encryptionService.hash(newPassword);
      user.passwordHash = passwordHash;
      user.updatedAt = this.clockService.now();
      await this.userRepository.update(user);
      return user.toFront();
    } catch (error) {
      return new Error("Token invalide ou expiré");
    }
  }
}
