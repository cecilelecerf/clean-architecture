import { InvalidCredentialsError } from "@application/errors/users/InvalidCredentialsError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { TokenService } from "@application/ports/services/TokenService";
import { UserEntity } from "@domain/entities/UserEntity";

type Props = {
  plainedPassword: string;
} & Pick<UserEntity, "email">;

export class LoginUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly tokenService: TokenService
  ) {}

  public async execute({
    email,
    plainedPassword,
  }: Props): Promise<{ user: UserEntity; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UserNotFoundError();
    const isValidPassword = await this.encryptionService.compare(
      plainedPassword,
      user.passwordHash
    );
    if (!isValidPassword) throw new InvalidCredentialsError();
    const token = await this.tokenService.generateAuthToken({
      userId: user.id,
    });
    return { user, token };
  }
}
