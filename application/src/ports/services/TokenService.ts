import { UserEntity } from "@domain/entities/UserEntity";

export interface GenerateTokenOptions {
  userId: UserEntity["id"];
  extraPayload?: Record<string, any>;
}

export interface TokenService {
  generateAuthToken(options: GenerateTokenOptions): Promise<string>;
  generateConfirmationToken(options: GenerateTokenOptions): Promise<string>;
  validateToken(
    token: string,
    expectedType?: "auth" | "confirmation" | "passwordReset"
  ): Promise<{ userId: UserEntity["id"] }>;
}
