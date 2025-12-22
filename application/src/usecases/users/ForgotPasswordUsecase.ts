import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { TokenService } from "@application/ports/services/TokenService";
import { UserNotFoundError } from "@application/errors/users";
import { Email } from "@domain/values/Email";
import { EmailInvalidFormatError } from "@domain/errors/email/EmailInvalidFormatError";

type Props = {
  email: string;
  confirmationUrl: string;
};

export class ForgotPasswordUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService
  ) {}

  public async execute({
    email,
    confirmationUrl,
  }: Props): Promise<void | UserNotFoundError | EmailInvalidFormatError> {
    const emailVO = Email.create(email);
    if (emailVO instanceof Error) return emailVO;
    const user = await this.userRepository.findByEmail(emailVO);
    if (!user) return new UserNotFoundError();

    const token = await this.tokenService.generateConfirmationToken({
      userId: user.id,
    });

    const resetLink = `${confirmationUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(user.email, {
      firstname: user.firstname,
      resetLink,
    });
  }
}
