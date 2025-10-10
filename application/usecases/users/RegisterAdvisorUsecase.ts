import { EmailAlreadyExistsError } from "@application/errors/users/EmailAlreadyExistsError";
import { UserNotFoundError } from "@application/errors/users/UserNotFoundError";
import { UserRoleMismatchError } from "@application/errors/users/UserRoleMismatchError";
import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EmailService } from "@application/ports/services/EmailService";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { PasswordGenerateService } from "@application/ports/services/PasswordGenerateService";
import { TokenService } from "@application/ports/services/TokenService";
import { UuidService } from "@application/ports/services/UuidService";
import { UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";

type Props = {
  email: string;
  confirmationUrl: string;
  directorId: UserEntity["id"];
} & Pick<UserEntity, "firstname" | "lastname">;

export class RegisterAdvisorStatus {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly uuidService: UuidService,
    private readonly clockService: ClockService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly passwordGenerateService: PasswordGenerateService
  ) {}

  public async execute({
    firstname,
    lastname,
    email,
    confirmationUrl,
    directorId,
  }: Props) {
    const actor = await this.userRepository.findById(directorId);
    if (!actor) throw new UserNotFoundError();
    if (!actor.hasRole({ role: "directeur" }))
      throw new UserRoleMismatchError(["directeur"], actor.role);

    const emailVO = Email.create(email);
    if (emailVO instanceof Error) throw emailVO;

    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) throw new EmailAlreadyExistsError(emailVO);

    const plainedPassword = this.passwordGenerateService.generate();
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
      role: "conseiller",
      isActiveField: false,
    });

    await this.userRepository.save(user);

    const token = await this.tokenService.generateConfirmationToken({
      userId: user.id,
    });
    const confirmationLink = `${confirmationUrl}?token=${token}`;

    this.emailService.sendEmail({
      to: user.email,
      subject: "Conseiller - Bienvenue sur notre plateform",
      text: `Clique ici pour valider ton inscription : ${confirmationLink}
      Information de connexion :
      - email : ${user.email},
      - mot de passe : ${plainedPassword}
      Pense à changer de mot de passe lors de ta première connexion.
      `,
    });
  }
}
