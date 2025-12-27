import { PasswordGenerateService } from "@application/ports/services/PasswordGenerateService";
import crypto from "crypto";

export class NodePasswordGenerateService implements PasswordGenerateService {
  generate(): string {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

    let password = "";
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }

    return password;
  }
}
