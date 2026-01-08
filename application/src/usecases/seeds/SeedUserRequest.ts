import { UserRepository } from "@application/ports/repositories/UserRepository";
import { ClockService } from "@application/ports/services/ClockService";
import { EncryptionService } from "@application/ports/services/EncryptionService";
import { UuidService } from "@application/ports/services/UuidService";
import { Address, UserEntity } from "@domain/entities/UserEntity";
import { Email } from "@domain/values/Email";

export interface SeedUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  sexe?: UserEntity["sexe"];
  address?: Address;
  dateOfBirth?: Date;
  role: "client" | "conseiller" | "directeur";
  createdAt?: Date;
  confirmedAt?: Date;
  updatedAt?: Date;
  isActiveField?: boolean;
}

export class SeedUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private encryptionService: EncryptionService,
    private uuidService: UuidService,
    private clockService: ClockService
  ) {}

  async execute(request: SeedUserRequest): Promise<UserEntity> {
    const email = Email.create(request.email);
    if (email instanceof Error) {
      throw new Error(`Invalid email: ${request.email}`);
    }

    const passwordHash = await this.encryptionService.hash(request.password);
    const now = this.clockService.now();

    const user = UserEntity.from({
      id: this.uuidService.generate(),
      email,
      passwordHash,
      firstname: request.firstName,
      lastname: request.lastName,
      phoneNumber: request.phoneNumber,
      address: request.address,
      dateOfBirth: request.dateOfBirth,
      sexe: request.sexe,
      role: request.role,
      createdAt: request.createdAt ?? now,
      confirmedAt: request.confirmedAt ?? now,
      updatedAt: request.updatedAt ?? now,
      isActiveField: request.isActiveField ?? true,
    });

    await this.userRepository.save(user);
    return user;
  }
}
