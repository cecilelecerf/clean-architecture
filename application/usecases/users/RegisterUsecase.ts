import { EmailAlreadyExistsError } from "@application/errors/users/EmailAlreadyExistsError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { TokenService } from "@application/ports/services/TokenService";
import { UuidService } from "@application/ports/services/UuidService";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";

type Props = {
  plainedPassword: string;
  email: string;
  confirmationUrl: string;
} & Pick<UserEntity, "firstname" | "lastname">;

export class RegisterUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService
  ) {}

  public async execute({
    firstname,
    lastname,
    email,
    plainedPassword,
    confirmationUrl,
  }: Props) {
    const emailVO = Email.create(email);
    if (emailVO instanceof Error) throw emailVO;

    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) throw new EmailAlreadyExistsError(emailVO);

    const passwordHash = await this.encryptionService.hash(plainedPassword);

    const id = this.uuidService.generate();

    const createdAt = this.clockService.now();

    const user = UserEntity.from({
      id,
      email: emailVO,
      firstname,
      lastname,
      passwordHash,
      createdAt,
      role: "client",
      isActiveField: false,
    });

    this.userRepository.saveUser(user);

    const token = await this.tokenService.generateConfirmationToken({
      userId: user.id,
    });
    const confirmationLink = `${confirmationUrl}?token=${token}`;

    this.emailService.sendEmail({
      to: user.email,
      subject: "Bienvenue sur notre plateform",
      text: `Clique ici pour valider ton inscription : ${confirmationLink}`,
    });
  }
}
