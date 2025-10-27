import { UserRepository } from "@application/ports/repositories/UserRepository";
import { EmailService } from "@application/ports/services/EmailService";
import { TokenService } from "@application/ports/services/TokenService";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
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

    // Préparer le lien de reset (exemple : frontend)
    const resetLink = `${confirmationUrl}/reset-password?token=${token}`;

    // Envoyer l'email
    await this.emailService.sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: `<p>Bonjour ${user.firstname} ${user.lastname},</p>
       <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
       <a href="${resetLink}">${resetLink}</a>`,
    });
  }
}
