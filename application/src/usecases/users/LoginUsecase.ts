import { InvalidCredentialsError } from "@application/errors/users/InvalidCredentialsError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { TokenService } from "@application/ports/services/TokenService";
import { UserEntity } from "@domain/entities/UserEntity";
import { EmailInvalidFormatError } from "@domain/errors/email/EmailInvalidFormatError";
import { Email } from "@domain/values/Email";

type Props = {
  plainedPassword: string;
  email: string;
};

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
    | EmailInvalidFormatError
  > {
    console.log("enter");
    console.log(email, plainedPassword);
    const emailVo = Email.create(email);
    if (emailVo instanceof Error) return emailVo;
    const user = await this.userRepository.findByEmail(emailVo);
    console.log(user);
    if (!user) return new UserNotFoundError();
    const isValidPassword = await this.encryptionService.compare(
      plainedPassword,
      user.passwordHash
    );
    console.log("verify");
    if (!isValidPassword) return new InvalidCredentialsError();
    const token = await this.tokenService.generateAuthToken({
      userId: user.id,
    });
    return { user, token };
  }
}
