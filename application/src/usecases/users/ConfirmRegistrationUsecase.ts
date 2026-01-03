import {
  InvalidTokenError,
  UserNotFoundError,
} from "@application/errors/users";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { TokenService } from "@application/ports/services/TokenService";
import { UserToDTO } from "@domain/entities/UserEntity";

type Props = {
  token: string;
};

export class ConfirmRegistrationUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly clockService: ClockService,
    private readonly tokenService: TokenService
  ) {}

  public async execute({
    token,
  }: Props): Promise<UserToDTO | InvalidTokenError | UserNotFoundError> {
    const payload = await this.tokenService.validateToken(
      token,
      "confirmation"
    );
    if (!payload || !payload.userId) return new InvalidTokenError();
    const user = await this.userRepository.findById(payload.userId);

    if (!user) return new UserNotFoundError();

    if (user.confirmedAt) return user.toDTO();

    user.confirmedAt = this.clockService.now();
    user.isActiveField = true;

    this.userRepository.update(user);
    return user.toDTO();
  }
}
