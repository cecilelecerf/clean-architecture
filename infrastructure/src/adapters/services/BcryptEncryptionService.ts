import { EncryptionService } from "@application/ports/services/EncryptionService";
import bcrypt from "bcryptjs";
export class BcryptEncryptionService implements EncryptionService {
  private readonly salt = 10;
  async hash(plainedTextPassword: string): Promise<string> {
    return bcrypt.hash(plainedTextPassword, this.salt);
  }
  async compare(
    plainedTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainedTextPassword, hashedPassword);
  }
}
