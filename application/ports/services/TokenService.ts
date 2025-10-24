export interface GenerateTokenOptions {
  userId: string;
  extraPayload?: Record<string, any>;
}

export interface TokenService {
  generateAuthToken(options: GenerateTokenOptions): Promise<string>;
  generateConfirmationToken(options: GenerateTokenOptions): Promise<string>;
  validateToken(
    token: string,
    expectedType?: "auth" | "confirmation"
  ): Promise<any>;
  invalidateToken(token: string): Promise<void>;
}
