import { InvalidCredentialsError } from "@application/src/errors/users/InvalidCredentialsError";
import { UserNotFoundError } from "@application/src/errors/users/UserNotFoundError";
import { UserRepository } from "@application/src/ports/repositories/UserRepository";
import { EncryptionService } from "@application/src/ports/services/EncryptionService";
import { TokenService } from "@application/src/ports/services/TokenService";
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
  }: Props): Promise<
    | { user: UserEntity; token: string }
    | UserNotFoundError
    | InvalidCredentialsError
  > {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return new UserNotFoundError();
    const isValidPassword = await this.encryptionService.compare(
      plainedPassword,
      user.passwordHash
    );
    if (!isValidPassword) return new InvalidCredentialsError();
    const token = await this.tokenService.generateAuthToken({
      userId: user.id,
    });
    return { user, token };
  }
}
